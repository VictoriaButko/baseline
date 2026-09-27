/**
 * PDF of a built document: LibreOffice converts the .docx that has already
 * passed the checks, so the PDF is that very document, not a second layout of
 * the markdown.
 *
 * LibreOffice stamps every export with the time and a random file ID. Those
 * are rewritten in place to values derived from the document — the date of its
 * source commit and a hash of the content — keeping their byte length, so the
 * cross-reference table stays valid. That does not make the export
 * reproducible (the embedded fonts come out in a different order each run),
 * so the builder converts only when the .docx changed; the stamps then at
 * least carry the date of the report rather than of the build.
 */

import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { tmpdir } from 'os';

const CANDIDATES = [
  process.env.SOFFICE,
  'soffice',
  'libreoffice',
  '/Applications/LibreOffice.app/Contents/MacOS/soffice'
].filter(Boolean);

let found;

/** The LibreOffice binary, or null when it is not installed */
export function soffice() {
  if (found !== undefined) return found;
  found = CANDIDATES.find(command => {
    const probe = spawnSync(command, ['--version'], { encoding: 'utf8' });
    return !probe.error && probe.status === 0;
  }) ?? null;
  return found;
}

/** D:YYYYMMDDHHmmSS of a unix time, in UTC */
function pdfDate(epoch) {
  const date = new Date(Number(epoch) * 1000);
  const pad = value => String(value).padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
}

/**
 * Rewrites the stamps of one export so that it depends on the document only.
 * Every replacement has the length of what it replaces.
 */
export function normalizePdf(buffer, epoch) {
  // latin1 maps every byte to one character and back, binary streams included
  let pdf = buffer.toString('latin1');
  const stamp = pdfDate(epoch);

  // /CreationDate(D:20260927213501+03'00') — digits only, same length
  pdf = pdf.replace(/(\/(?:CreationDate|ModDate)\s*\(D:)(\d{14})/g, (match, key) => key + stamp);

  // XMP, when the export writes it: 2026-09-27T21:35:01
  const iso = `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T` +
    `${stamp.slice(8, 10)}:${stamp.slice(10, 12)}:${stamp.slice(12, 14)}`;
  pdf = pdf.replace(/(<xmp:(?:CreateDate|ModifyDate|MetadataDate)>)\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g,
    (match, tag) => tag + iso);

  // /ID [<hex><hex>]: the hash of everything but the ID itself, cut to length
  const withoutId = pdf.replace(/\/ID\s*\[\s*<[0-9A-Fa-f]*>\s*<[0-9A-Fa-f]*>\s*\]/g, '');
  const digest = createHash('sha256').update(withoutId, 'latin1').digest('hex').toUpperCase();
  pdf = pdf.replace(/(\/ID\s*\[\s*<)([0-9A-Fa-f]*)(>\s*<)([0-9A-Fa-f]*)(>\s*\])/g,
    (match, open, first, middle, second, close) =>
      open + digest.slice(0, first.length).padEnd(first.length, '0') +
      middle + digest.slice(0, second.length).padEnd(second.length, '0') + close);

  return Buffer.from(pdf, 'latin1');
}

/**
 * Converts a .docx into a PDF next to it (ЛР03_21.docx → ЛР03_21.pdf).
 *
 * @param epoch  the time to stamp the PDF with — the date of the report's commit
 * @returns the path of the PDF
 */
export function toPdf(docxPath, { epoch }) {
  const binary = soffice();
  if (!binary) throw new Error('LibreOffice (soffice) is not installed — cannot make the PDF');

  const pdfPath = docxPath.replace(/\.docx$/, '.pdf');
  const work = mkdtempSync(join(tmpdir(), 'report-pdf-'));

  try {
    // A profile of its own: parallel conversions do not wait on a shared lock,
    // and the user's settings do not leak into the output
    const profile = `file://${join(work, 'profile')}`;
    const result = spawnSync(binary, [
      `-env:UserInstallation=${profile}`,
      '--headless', '--norestore', '--nologo',
      '--convert-to', 'pdf:writer_pdf_Export',
      '--outdir', work,
      docxPath
    ], { encoding: 'utf8', timeout: 180_000 });

    const produced = join(work, basename(pdfPath));
    if (result.error || result.status !== 0 || !existsSync(produced)) {
      throw new Error(`LibreOffice could not convert the document: ${result.error?.message ?? (result.stderr || result.stdout).trim()}`);
    }

    // written, not renamed: the temporary directory may be on another device
    writeFileSync(pdfPath, normalizePdf(readFileSync(produced), epoch));
    return pdfPath;
  } catch (error) {
    rmSync(pdfPath, { force: true });
    throw error;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

export const pdfOf = docxPath => join(dirname(docxPath), basename(docxPath).replace(/\.docx$/, '.pdf'));
