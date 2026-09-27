#!/usr/bin/env node
/**
 * Encrypts the quiz answer keys so they can live in the public repository.
 *
 * Every lecture quiz has an answer key next to it: 01-lecture-intro.answers.
 * The plaintext is ignored by git — students read the repository. What git
 * tracks is 01-lecture-intro.answers.age, the same file encrypted with age
 * (https://age-encryption.org) and ASCII-armored.
 *
 * The files are encrypted to the public keys in .age-recipients, so the
 * ciphertext is written without a secret. Decrypting needs the secret key,
 * which is kept in a password manager and copied to one of:
 *   - the BASELINE_AGE_KEY environment variable;
 *   - ~/.config/baseline/answers.key (mode 0600).
 * The key is outside the repository on purpose: it can not be committed by
 * accident, and every worktree of the repository finds the same key.
 *
 * The ciphertext is public forever — git history can not be recalled. A leaked
 * key therefore means leaked answers: rotating it protects only future keys.
 *
 * Usage:
 *   node scripts/answers-crypt.mjs keygen       new key pair, prints the public key
 *   node scripts/answers-crypt.mjs import-key   store a key pasted from the password manager
 *   node scripts/answers-crypt.mjs encrypt      *.answers → *.answers.age (changed files only)
 *   node scripts/answers-crypt.mjs decrypt      *.answers.age → *.answers [--force]
 *   node scripts/answers-crypt.mjs status       what differs between the two
 *   node scripts/answers-crypt.mjs check        no plaintext and no key tracked (CI, needs no key)
 */

import { execFileSync } from 'child_process';
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, join, relative } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const RECIPIENTS = join(ROOT, '.age-recipients');
const KEY_FILE = join(homedir(), '.config', 'baseline', 'answers.key');
const KEY_ENV = 'BASELINE_AGE_KEY';

const PLAIN = '.answers';
const SEALED = '.answers.age';

// Matches a real secret key, not its mention in docs ("AGE-SECRET-KEY-1...")
const SECRET_KEY = /AGE-SECRET-KEY-1[0-9A-Z]{50,}/;

// age-encryption is needed for everything but `check`, which CI runs without npm ci
const age = () => import('age-encryption');

/* ── Keys ──────────────────────────────────────────────────────────────────── */

function readRecipients() {
  if (!existsSync(RECIPIENTS)) throw new Error('no .age-recipients — run `npm run answers:keygen` first');
  const recipients = readFileSync(RECIPIENTS, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
  if (!recipients.length) throw new Error('.age-recipients lists no public key');
  return recipients;
}

/** The secret key, or null when this machine has none */
function findIdentity() {
  const fromEnv = process.env[KEY_ENV]?.trim();
  if (fromEnv) return { identity: fromEnv, source: `$${KEY_ENV}` };
  if (existsSync(KEY_FILE)) return { identity: readFileSync(KEY_FILE, 'utf8').trim(), source: KEY_FILE };
  return null;
}

/** Fails early and clearly when a key is malformed or not one .age-recipients encrypts to */
async function validateIdentity(identity, source) {
  const { identityToRecipient } = await age();
  let recipient;
  try {
    recipient = await identityToRecipient(identity);
  } catch {
    throw new Error(`the key in ${source} is not an age secret key`);
  }
  if (!readRecipients().includes(recipient)) {
    throw new Error(`the key in ${source} does not match any public key in .age-recipients`);
  }
}

async function requireIdentity() {
  const found = findIdentity();
  if (!found) {
    throw new Error(
      `no secret key: set $${KEY_ENV} or run \`npm run answers:import-key\` ` +
      '(the key is in Passwords, entry "baseline — quiz answers key")'
    );
  }
  await validateIdentity(found.identity, found.source);
  return found.identity;
}

function storeKey(identity) {
  mkdirSync(dirname(KEY_FILE), { recursive: true, mode: 0o700 });
  writeFileSync(KEY_FILE, `${identity}\n`, { mode: 0o600 });
  chmodSync(KEY_FILE, 0o600);   // mode applies only to a newly created file
}

async function keygen() {
  if (findIdentity()) throw new Error(`a key already exists (${KEY_FILE} or $${KEY_ENV}) — refusing to replace it`);

  const { generateX25519Identity, identityToRecipient } = await age();
  const identity = await generateX25519Identity();
  const recipient = await identityToRecipient(identity);
  storeKey(identity);

  console.log(`Secret key written to ${KEY_FILE}`);
  console.log(`Public key: ${recipient}\n`);
  if (!existsSync(RECIPIENTS)) {
    writeFileSync(RECIPIENTS, `# Public keys the quiz answer keys are encrypted to (scripts/answers-crypt.mjs)\n${recipient}\n`);
    console.log('Public key written to .age-recipients — commit it.');
  } else {
    console.log('Add the public key to .age-recipients, then run encrypt.');
  }
  console.log(`Save the secret key in Passwords, entry "baseline — quiz answers key": pbcopy < ${KEY_FILE}`);
  console.log('Without it the answer keys can not be decrypted anywhere else.');
}

/** Hidden input on a terminal, or the whole of stdin when piped (pbpaste | ...) */
async function readSecret(prompt) {
  if (!process.stdin.isTTY) {
    let data = '';
    for await (const chunk of process.stdin) data += chunk;
    return data.trim();
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  rl._writeToOutput = text => { if (text.includes(prompt)) process.stdout.write(text); };
  const answer = await new Promise(resolve => rl.question(prompt, resolve));
  rl.close();
  process.stdout.write('\n');
  return answer.trim();
}

async function importKey() {
  if (existsSync(KEY_FILE)) throw new Error(`${KEY_FILE} already exists — delete it first to replace the key`);

  const identity = await readSecret('Paste the secret key from Passwords: ');
  await validateIdentity(identity, 'the pasted text');
  storeKey(identity);
  console.log(`Key stored in ${KEY_FILE}`);
}

/* ── Files ─────────────────────────────────────────────────────────────────── */

/** Every answer key under content/, as base paths without extension, with what exists of each */
function listAnswerKeys() {
  const keys = new Map();
  for (const entry of readdirSync(CONTENT, { recursive: true })) {
    const path = join(CONTENT, entry);
    for (const ext of [SEALED, PLAIN]) {
      if (!path.endsWith(ext)) continue;
      const base = path.slice(0, -ext.length);
      const key = keys.get(base) ?? { base, plain: false, sealed: false };
      key[ext === PLAIN ? 'plain' : 'sealed'] = true;
      keys.set(base, key);
      break;
    }
  }
  return [...keys.values()].sort((a, b) => a.base.localeCompare(b.base));
}

const plainPath = key => key.base + PLAIN;
const sealedPath = key => key.base + SEALED;
const show = path => relative(ROOT, path);

async function makeDecrypter(identity) {
  const { Decrypter, armor } = await age();
  const decrypter = new Decrypter();
  decrypter.addIdentity(identity);
  return async path => {
    try {
      return await decrypter.decrypt(armor.decode(readFileSync(path, 'utf8')), 'text');
    } catch {
      throw new Error(`${show(path)} can not be decrypted with this key`);
    }
  };
}

async function encrypt() {
  const decrypt = await makeDecrypter(await requireIdentity());
  const { Encrypter, armor } = await age();
  const encrypter = new Encrypter();
  for (const recipient of readRecipients()) encrypter.addRecipient(recipient);

  let written = 0;
  for (const key of listAnswerKeys()) {
    if (!key.plain) {
      console.log(`[skip] ${show(sealedPath(key))} — no plaintext, run decrypt`);
      continue;
    }
    const text = readFileSync(plainPath(key), 'utf8');
    // age output is randomized: re-encrypting an unchanged file would still show up in the diff
    if (key.sealed && await decrypt(sealedPath(key)) === text) continue;

    writeFileSync(sealedPath(key), armor.encode(await encrypter.encrypt(text)));
    console.log(`[encrypted] ${show(sealedPath(key))}`);
    written++;
  }
  console.log(`\nEncrypted: ${written}`);
}

async function decrypt(force) {
  const decryptFile = await makeDecrypter(await requireIdentity());

  let written = 0;
  let conflicts = 0;
  for (const key of listAnswerKeys()) {
    if (!key.sealed) continue;
    const text = await decryptFile(sealedPath(key));

    if (key.plain) {
      const current = readFileSync(plainPath(key), 'utf8');
      if (current === text) continue;
      if (!force) {
        console.log(`[conflict] ${show(plainPath(key))} — local edits not encrypted yet`);
        conflicts++;
        continue;
      }
    }
    writeFileSync(plainPath(key), text);
    console.log(`[decrypted] ${show(plainPath(key))}`);
    written++;
  }
  console.log(`\nDecrypted: ${written}`);
  if (conflicts) {
    console.log(`Conflicts: ${conflicts} — encrypt the local edits, or rerun with --force to discard them`);
    process.exitCode = 1;
  }
}

async function status() {
  const decrypt = await makeDecrypter(await requireIdentity());

  const pending = [];
  for (const key of listAnswerKeys()) {
    if (!key.sealed) pending.push(`[new]       ${show(plainPath(key))} — not encrypted yet`);
    else if (!key.plain) pending.push(`[missing]   ${show(plainPath(key))} — run decrypt`);
    else if (await decrypt(sealedPath(key)) !== readFileSync(plainPath(key), 'utf8')) {
      pending.push(`[modified]  ${show(plainPath(key))} — differs from ${SEALED}`);
    }
  }
  console.log(pending.length ? pending.join('\n') : 'All answer keys are in sync.');
}

/* ── CI check ──────────────────────────────────────────────────────────────── */

function git(...args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  } catch (error) {
    if (error.status === 1) return '';   // git grep: nothing found
    throw error;
  }
}

/** A valid ASCII-armored age file, checked without the key or the age library */
function isSealed(text) {
  const match = text.trim().match(/^-----BEGIN AGE ENCRYPTED FILE-----\r?\n([A-Za-z0-9+/=\r\n]+)\r?\n-----END AGE ENCRYPTED FILE-----$/);
  return !!match && Buffer.from(match[1], 'base64').toString('latin1').startsWith('age-encryption.org/v1\n');
}

function check() {
  const tracked = git('ls-files', '-z').split('\0').filter(Boolean);
  const problems = [];

  for (const path of tracked.filter(path => path.endsWith(PLAIN))) {
    problems.push(`${path} — plaintext answer key is tracked`);
  }
  for (const path of tracked.filter(path => path.endsWith(SEALED))) {
    if (!isSealed(readFileSync(join(ROOT, path), 'utf8'))) problems.push(`${path} — not an age-encrypted file`);
  }
  for (const path of git('grep', '-lIE', SECRET_KEY.source).split('\n').filter(Boolean)) {
    problems.push(`${path} — contains an age secret key`);
  }

  if (problems.length) {
    for (const problem of problems) console.error(`[error] ${problem}`);
    process.exitCode = 1;
  } else {
    console.log('No plaintext answer keys or secret keys in the repository.');
  }
}

/* ── CLI ───────────────────────────────────────────────────────────────────── */

const commands = {
  keygen,
  'import-key': importKey,
  encrypt,
  decrypt: () => decrypt(process.argv.includes('--force')),
  status,
  check,
};

const command = commands[process.argv[2]];
if (!command) {
  console.error(`Usage: answers-crypt.mjs <${Object.keys(commands).join('|')}>`);
  process.exit(1);
}

try {
  await command();
} catch (error) {
  console.error(`[error] ${error.message}`);
  process.exit(1);
}
