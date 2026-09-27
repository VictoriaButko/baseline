#!/usr/bin/env node
/**
 * Student report (markdown) → .docx in the standard college format.
 *
 * A student writes only the procedure, the answers and the conclusion. The title
 * page, the topic, the aim and the equipment come from where they already exist:
 * the title-page sample and the lab material in content/. The lab number follows
 * the curriculum of the group, so the same lab is No. 5 for KMP-23 and No. 11
 * for PZ-24.
 *
 * Usage:
 *   node scripts/build-report-docx.mjs reports/…/report.md    # given reports
 *   node scripts/build-report-docx.mjs --changed              # changed in HEAD
 *   node scripts/build-report-docx.mjs --changed --since=main
 *   node scripts/build-report-docx.mjs --files-from=changed.txt   # reports these files touch
 *   node scripts/build-report-docx.mjs --all                      # every report of the branch
 *
 *   --list=built.txt   append the path of every document built (CI preview)
 *
 * Next to every .docx goes its PDF, converted by LibreOffice (scripts/lib/pdf.mjs)
 * when the .docx changed; --rebuild-pdf converts every one again.
 * Without LibreOffice the PDF is skipped with a warning, unless
 * REPORTS_REQUIRE_PDF=1 — as in CI — makes that an error.
 *
 * Every document is checked against the samples (scripts/lib/report-checks.mjs)
 * before it is kept; a report that fails leaves no document behind, and the
 * exit status is 1.
 */

import { spawnSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, mkdtempSync } from 'fs';
import { join, dirname, basename, relative, resolve, sep } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath, pathToFileURL } from 'url';

import { convert, run, sourceDateEpoch } from './lib/docx.mjs';
import { pdfOf, soffice, toPdf } from './lib/pdf.mjs';
import { parseFrontmatter } from './lib/frontmatter.mjs';
import { answerLevels, checkPdf, checkReport, reportWarnings } from './lib/report-checks.mjs';

// CI sets it: there a report without its PDF is a failed report. Locally the
// PDF is made when LibreOffice is installed and skipped with a warning if not.
const REQUIRE_PDF = process.env.REPORTS_REQUIRE_PDF === '1';

// --rebuild-pdf converts even when the .docx did not change — after a change
// to the conversion itself (LibreOffice, fonts)
const REBUILD_PDF = process.argv.includes('--rebuild-pdf');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content', 'uk');
const REPORTS = join(ROOT, 'reports');
const TEMPLATE = join(ROOT, 'scripts', 'templates', 'report-template.docx');
const TITLE_TEMPLATES = join(ROOT, 'scripts', 'templates');
const FILTER = join(ROOT, 'scripts', 'templates', 'report-filter.lua');

// Text width of a report: A4 minus the 25 and 10 mm margins. Tables as in the
// report sample: centred, header row centred, rows at least 0.8 cm high.
const LAYOUT = {
  tableWidth: 11906 - 1418 - 567,
  list: { left: 1134, hanging: 425, bullet: '–' },
  table: { align: 'center', headerAlign: 'center', rowHeight: 454 }
};

const TEACHER = 'Костенко А.О.';

const DISCIPLINE = {
  '01-operating-systems': 'ОПЕРАЦІЙНІ СИСТЕМИ',
  '02-software-security-methods': 'ПРОГРАМНІ МЕТОДИ ЗАХИСТУ ІНФОРМАЦІЇ'
};

/**
 * Work code on the title page: ФКЗЕ. <specialty><subject><number>. <NN>ЛР
 *
 * The specialty depends on the group rather than the subject: PZ-24 is 121,
 * PZ-25 is already F2 under the new classifier, KMP is 123. The values come from
 * _programs.json, where they were copied from the curricula.
 *
 * XX is the student's position in the group list, not the task variant — the
 * two usually coincide but not always. Two digits; without a number XX is left
 * in place so that it is visible on the title page.
 */
function workCode({ specialty, abbr, number, lab }) {
  const position = number ? String(number).padStart(2, '0') : 'XX';
  return `ФКЗЕ. ${specialty}${abbr}${position}. ${String(lab).padStart(2, '0')}ЛР`;
}

/**
 * Academic year as the title pages spell it: "2026 - 2027" for a year that
 * starts in September.
 */
function academicYear(date = new Date()) {
  const start = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
  return `${start} - ${start + 1}`;
}

/**
 * Name as the title page signs it: "Костенко Артем Олегович" → "Костенко А.О.",
 * the way the teacher's name is written a line below. The frontmatter keeps
 * the full name; a name of one word is left as it is.
 */
export function signature(fullName) {
  const [surname, ...given] = String(fullName).trim().split(/\s+/);
  if (!given.length) return surname;
  return `${surname} ${given.map(name => `${name[0].toUpperCase()}.`).join('')}`;
}

/**
 * Every picture the report embeds must exist next to it. Pandoc replaces a
 * picture it cannot read with the alt text and goes on, so a report whose
 * screenshots were never uploaded built into a document with captions and no
 * pictures. The path also has to stay inside the student's directory.
 */
export function missingImages(body, reportDir) {
  const images = [...body.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)].map(m => m[1]);

  return images
    .filter(src => !/^[a-z]+:/i.test(src))
    .filter(src => {
      let path;
      try { path = resolve(reportDir, decodeURI(src)); } catch { return true; }
      return !path.startsWith(reportDir + sep) || !existsSync(path) || !statSync(path).isFile();
    });
}

function fail(message) {
  console.error(`[error] ${message}`);
  process.exitCode = 1;
}

const escapeXml = value =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Every .md of a course — used to find a lab by its number in the group's curriculum */
function courseFiles(course) {
  const base = join(CONTENT, course);
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter(entry => statSync(join(base, entry)).isDirectory())
    .flatMap(module =>
      readdirSync(join(base, module))
        .filter(file => file.endsWith('.md'))
        .map(file => ({ key: `${module}/${file.replace(/\.md$/, '')}`, path: join(base, module, file) }))
    );
}

/**
 * The lab a report describes. The number is read against the group's curriculum:
 * _programs.json tells which lab carries number N for this particular group.
 */
function findLab({ course, group, lab }) {
  const programsPath = join(CONTENT, course, '_programs.json');
  if (!existsSync(programsPath)) throw new Error(`missing ${relative(ROOT, programsPath)}`);

  const programs = JSON.parse(readFileSync(programsPath, 'utf8'));
  const groupEntry = programs.groups?.find(entry => entry.id === group);
  if (!groupEntry) throw new Error(`group "${group}" is not listed in the curricula of ${course}`);

  const key = Object.entries(programs.lessons).find(
    ([, byProgram]) => byProgram[groupEntry.program]?.labNumber === lab
  )?.[0];

  if (!key) throw new Error(`the curriculum of ${group} has no lab number ${lab}`);

  const file = courseFiles(course).find(entry => entry.key === key);
  if (!file) throw new Error(`material ${key} not found`);

  const { data, body } = parseFrontmatter(readFileSync(file.path, 'utf8'));
  const lead = label => body.match(new RegExp(`^\\*\\*${label}:\\*\\*\\s*(.+)$`, 'm'))?.[1]?.trim();

  return {
    topic: data.title ?? data.shortTitle ?? key,
    goal: lead('Мета'),
    equipment: lead('Обладнання') ?? data.equipment?.join('; ')
  };
}

/** Title page as raw OOXML with the values substituted */
function titlePage(report) {
  const values = {
    lab: report.lab,
    discipline: DISCIPLINE[report.course] ?? report.course,
    student: signature(report.student),
    group: report.groupTitle,
    teacher: report.teacher ?? TEACHER,
    year: report.year ?? new Date().getFullYear(),
    academicYear: report.academicYear ?? academicYear(),
    code: workCode(report)
  };

  // Each course has its own title page: the discipline, the code and the year
  // are spelled differently in the samples
  const template = join(TITLE_TEMPLATES, `report-title-${report.course}.xml`);
  if (!existsSync(template)) throw new Error(`no title page for course ${report.course}`);

  const xml = readFileSync(template, 'utf8').replace(/^<!--[\s\S]*?-->\s*/, '');

  return xml.replace(/{{(\w+)}}/g, (match, key) =>
    key in values ? escapeXml(values[key]) : match
  );
}

/** Report path → course, group, lab and the student's position in the group */
function parsePath(reportPath) {
  const LAYOUT = ['course', null, 'group', null, 'lab', null, 'student', null];
  const parts = relative(REPORTS, reportPath).split('/');

  // <course>/groups/<group>/labs/<NN>/students/<NN>/report.md
  const shaped =
    parts.length === LAYOUT.length &&
    parts[1] === 'groups' && parts[3] === 'labs' && parts[5] === 'students';

  if (!shaped) {
    throw new Error(
      'path must be reports/<course>/groups/<group>/labs/<NN>/students/<NN>/report.md'
    );
  }

  return Object.fromEntries(
    LAYOUT.map((name, index) => name && [name, parts[index]]).filter(Boolean)
  );
}

/**
 * A stub is a report the student has not written yet: opening an assignment
 * creates one per student, and those must not turn into documents.
 *
 * The test is structural rather than a word count: a stub holds nothing but the
 * task comment, the section headings and empty numbered items. One line of real
 * writing anywhere makes it a report, however short.
 */
function isStub(body) {
  return body
    .replace(/<!--[\s\S]*?-->/g, '')      // the task in a comment
    .split('\n')
    .map(line => line.trim())
    .every(line =>
      line === '' ||
      /^#{1,6}\s/.test(line) ||           // a section heading
      /^\d+$/.test(line)                  // a numbered item with no text
    );
}

/**
 * The student's full name from the group list. The list is the teacher's and
 * is kept up to date; the name in a report's frontmatter is a copy made when
 * the assignment was opened, and it stays as it was when the list is corrected
 * later — a patronymic added, a typo fixed. So the title page and the document
 * properties take the name from the list, by the student's number, and the
 * frontmatter only stands in for a group that has no list.
 */
function listedName({ course, group, student }) {
  const path = join(REPORTS, course, 'groups', group, 'students.json');
  if (!existsSync(path)) return null;

  const list = JSON.parse(readFileSync(path, 'utf8'));
  return list.students?.find(entry => Number(entry.number) === Number(student))?.name?.trim() || null;
}

function buildReport(reportPath) {
  const location = parsePath(reportPath);
  const { data, body } = parseFrontmatter(readFileSync(reportPath, 'utf8'));

  if (isStub(body)) {
    console.log(`[skip] ${relative(ROOT, reportPath)} — stub, nothing to build`);
    return null;
  }

  for (const field of ['course', 'group', 'lab']) {
    if (!data[field]) throw new Error(`frontmatter has no "${field}" field`);
  }
  // A report filed in the wrong folder would be built under somebody else's
  // number, so the path and the frontmatter have to tell the same story
  const pad = value => String(value).padStart(2, '0');
  const mismatch = [
    ['course', data.course, location.course],
    ['group', data.group, location.group],
    ['lab', pad(data.lab), location.lab],
    ['student', pad(data.number ?? location.student), location.student]
  ].find(([, stated, inPath]) => String(stated) !== inPath);

  if (mismatch) {
    const [field, stated, inPath] = mismatch;
    throw new Error(`frontmatter says ${field} ${stated}, the path says ${inPath}`);
  }

  const listed = listedName(location);
  const student = listed ?? (data.student ? String(data.student).trim() : null);
  if (!student) {
    throw new Error(`student ${location.student} is not in the group list, and the frontmatter has no "student" field`);
  }
  if (listed && data.student && String(data.student).trim() !== listed) {
    console.warn(`[warn] ${relative(ROOT, reportPath)}: the frontmatter names "${data.student}", ` +
      `the group list "${listed}" — the list is used`);
  }

  const programs = JSON.parse(readFileSync(join(CONTENT, data.course, '_programs.json'), 'utf8'));
  const groupEntry = programs.groups?.find(entry => entry.id === data.group);

  const levels = answerLevels(body);
  if (levels.length > 1) {
    throw new Error(
      `the answers cover ${levels.length} levels (${levels.join(', ')}) — ` +
      'answer the questions of one level only, the one you defend the work for'
    );
  }

  const missing = missingImages(body.replace(/<!--[\s\S]*?-->/g, ''), dirname(reportPath));
  if (missing.length) {
    throw new Error(
      `the report shows ${missing.length === 1 ? 'a picture that is' : 'pictures that are'} not in the repository: ` +
      `${missing.join(', ')} — upload ${missing.length === 1 ? 'it' : 'them'} next to report.md (assets/)`
    );
  }

  const lab = findLab(data);
  const report = {
    ...data,
    student,
    // the folder is the position in the group, so the path is the source of it
    number: Number(location.student),
    groupTitle: groupEntry?.title ?? data.group,
    specialty: groupEntry?.specialty ?? '',
    abbr: programs.abbr ?? ''
  };

  // The student writes no topic, aim or equipment — those come from the lab
  const preamble = [
    `**Тема:** ${lab.topic}.`,
    lab.goal ? `**Мета:** ${lab.goal}` : null,
    lab.equipment ? `**Обладнання:** ${lab.equipment}` : null,
    data.variant ? `**Варіант:** ${data.variant}.` : null
  ].filter(Boolean).join('\n\n');

  const source = [
    '```{=openxml}',
    titlePage(report),
    '```',
    '',
    '```{=openxml}',
    '<w:p><w:r><w:br w:type="page"/></w:r></w:p>',
    '```',
    '',
    preamble,
    '',
    body.trim()
  ].join('\n');

  const work = mkdtempSync(join(tmpdir(), 'report-'));
  const outputPath = join(
    dirname(reportPath),
    `ЛР${String(data.lab).padStart(2, '0')}_${location.student}.docx`
  );

  // The document as it was before this build: if the new one comes out the
  // same, its PDF does not need converting again (see below)
  const previous = existsSync(outputPath) ? readFileSync(outputPath) : null;

  try {
    const sourcePath = join(work, 'report.md');
    writeFileSync(sourcePath, source);

    convert(sourcePath, outputPath, {
      dateFrom: reportPath,
      referenceDoc: TEMPLATE,
      filter: FILTER,
      layout: LAYOUT,
      properties: { title: `${lab.topic}. Звіт з лабораторної роботи №${data.lab}`, author: student },
      cwd: ROOT,
      // report images are relative to the student's directory
      resourcePath: dirname(reportPath)
    });

    // The document is kept only if it matches the samples; a failed check
    // leaves nothing behind for the pipeline to commit
    const expected = {
      body,
      student,
      signature: signature(student),
      lab: data.lab,
      code: workCode(report)
    };
    const problems = checkReport(outputPath, expected);
    if (problems.length) {
      rmSync(outputPath, { force: true });
      throw new Error(`the document does not match the report sample:\n  - ${problems.join('\n  - ')}`);
    }

    for (const warning of reportWarnings(body)) {
      console.warn(`[warn] ${relative(ROOT, reportPath)}: ${warning}`);
    }
    console.log(`[ok] ${relative(ROOT, outputPath)}`);

    // The PDF is made from the checked .docx and checked in turn. The two go
    // together: a PDF that fails takes the .docx with it, so the repository
    // never holds one without the other, or two that disagree.
    const pdfPath = pdfOf(outputPath);
    if (!soffice() && !REQUIRE_PDF) {
      // The PDF of an unchanged document is still its PDF and stays; the PDF
      // of a changed one no longer matches it and goes
      const current = existsSync(pdfPath) && previous?.equals(readFileSync(outputPath));
      if (!current) rmSync(pdfPath, { force: true });
      console.warn(`[warn] LibreOffice is not installed — ${basename(pdfPath)} ${current ? 'kept as it is' : 'not made'}`);
      return { docx: outputPath, pdf: current ? pdfPath : null };
    }

    try {
      // LibreOffice does not export the same bytes twice — it embeds the fonts
      // in a different order each run — so a PDF is made again only when its
      // .docx changed. The .docx is reproducible: the same report gives the
      // same bytes, and then the PDF next to it is still the PDF of it. It is
      // checked all the same, and converted again if it fails.
      const unchanged = !REBUILD_PDF && previous && existsSync(pdfPath) &&
        previous.equals(readFileSync(outputPath)) && checkPdf(pdfPath, expected).length === 0;

      if (unchanged) {
        console.log(`[ok] ${relative(ROOT, pdfPath)} — the document did not change, the PDF is kept`);
        return { docx: outputPath, pdf: pdfPath };
      }

      toPdf(outputPath, { epoch: sourceDateEpoch(reportPath) });
      const pdfProblems = checkPdf(pdfPath, expected);
      if (pdfProblems.length) {
        throw new Error(`the PDF does not match the report sample:\n  - ${pdfProblems.join('\n  - ')}`);
      }
    } catch (error) {
      rmSync(pdfPath, { force: true });
      rmSync(outputPath, { force: true });
      throw error;
    }

    console.log(`[ok] ${relative(ROOT, pdfPath)}`);
    return { docx: outputPath, pdf: pdfPath };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/**
 * Reports a list of changed files touches. A screenshot uploaded after the text
 * changes the document as much as the text does, so any file inside a
 * student's directory — report.md, assets/, src/ — or the generated .docx
 * itself (it came over from a branch built by an older pipeline) stands for
 * the report.md next to it. Deleted reports and internal directories
 * (_template) are left out.
 */
export function reportsOf(paths) {
  const reports = new Set();

  for (const path of paths.map(line => line.trim()).filter(Boolean)) {
    const parts = path.split('/');
    const at = parts.indexOf('students');
    if (parts[0] !== 'reports' || at === -1 || parts.length < at + 3) continue;
    if (parts.some(part => part.startsWith('_'))) continue;

    const report = join(ROOT, ...parts.slice(0, at + 2), 'report.md');
    if (existsSync(report)) reports.add(report);
  }

  return [...reports].sort();
}

/** Every report in the working tree */
function allReports() {
  const found = [];
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name === 'report.md') found.push(path);
    }
  };
  if (existsSync(REPORTS)) walk(REPORTS);
  return found.sort();
}

/** Reports changed in the last commit, or against the given ref */
function changedReports(since) {
  // GitHub passes all zeros when a branch is created, and a shallow clone may
  // not contain the given commit — fall back to the last commit then
  const resolvable = since && !/^0+$/.test(since) &&
    spawnSync('git', ['rev-parse', '--verify', '--quiet', `${since}^{commit}`], { cwd: ROOT }).status === 0;

  if (since && !resolvable) {
    console.warn(`[warn] commit "${since}" is unreachable — using the last commit instead`);
  }

  const range = resolvable ? `${since}...HEAD` : 'HEAD~1..HEAD';
  return reportsOf(run('git', ['diff', '--name-only', range], { cwd: ROOT }).split('\n'));
}

/** Where a report's document goes: ЛР<lab>_<student>.docx next to it */
function outputOf(reportPath) {
  const { lab, student } = parsePath(reportPath);
  return join(dirname(reportPath), `ЛР${lab}_${student}.docx`);
}

function main() {
  const args = process.argv.slice(2);
  const option = name => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  const since = option('since');
  const filesFrom = option('files-from');
  const list = option('list');

  const targets = args.includes('--all')
    ? allReports()
    : filesFrom
      ? reportsOf(readFileSync(filesFrom, 'utf8').split('\n'))
      : args.includes('--changed')
        ? changedReports(since)
        : args.filter(arg => !arg.startsWith('--')).map(arg => join(ROOT, arg));

  if (!targets.length) {
    console.log('No changed reports.');
    return;
  }

  const summary = [];
  for (const target of targets) {
    const name = relative(ROOT, target);
    try {
      const built = buildReport(target);
      const files = built ? [built.docx, built.pdf].filter(Boolean) : [];
      summary.push(built
        ? `| ✅ | \`${name}\` | ${files.map(file => basename(file)).join(', ')} |`
        : `| ➖ | \`${name}\` | заготовка, не збирається |`);
      // CI collects what was built — and only that — for the preview
      for (const file of list ? files : []) writeFileSync(list, `${relative(ROOT, file)}\n`, { flag: 'a' });
    } catch (error) {
      fail(`${name}: ${error.message}`);
      summary.push(`| ❌ | \`${name}\` | ${error.message.split('\n').join('<br>')} |`);

      // A document left over from an earlier build no longer matches the
      // report — better no document than a wrong one
      try {
        for (const stale of [outputOf(target), pdfOf(outputOf(target))]) {
          if (existsSync(stale)) {
            rmSync(stale);
            console.error(`[error] removed ${relative(ROOT, stale)}: it no longer matches the report`);
          }
        }
      } catch { /* a malformed path has no document */ }
    }
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSync(process.env.GITHUB_STEP_SUMMARY,
      ['### Звіти', '', '| | Звіт | Результат |', '|---|---|---|', ...summary, ''].join('\n'),
      { flag: 'a' });
  }
}

// Run as a script; imported (by the checks) only the helpers are wanted
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
