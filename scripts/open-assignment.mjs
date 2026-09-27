#!/usr/bin/env node
/**
 * Opens a lab assignment: creates a directory and a report stub for every
 * student of a group.
 *
 * The teacher runs this on a `lab/**` branch, reviews the result and merges it.
 * From that moment every student has a folder of their own with the task of
 * their variant already written in, so nobody has to guess the path or the
 * assignment.
 *
 * The group list lives in reports/<course>/groups/<group>/students.json and is
 * reused by every later assignment of that group. A student's folder is their
 * position in that list, so the path of a report is stable from the day the
 * group is entered — before anybody has named a GitHub account.
 *
 * Usage:
 *   node scripts/open-assignment.mjs --course=02-software-security-methods \
 *                                    --group=pz-23-1-9 --lab=3
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

import { parseFrontmatter } from './lib/frontmatter.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content', 'uk');
const REPORTS = join(ROOT, 'reports');

/** The lab a number refers to in this group, and its variants */
function findLab(course, group, lab) {
  const programs = JSON.parse(readFileSync(join(CONTENT, course, '_programs.json'), 'utf8'));

  const groupEntry = programs.groups?.find(entry => entry.id === group);
  if (!groupEntry) throw new Error(`group "${group}" is not listed in the curricula of ${course}`);

  const key = Object.entries(programs.lessons).find(
    ([, byProgram]) => byProgram[groupEntry.program]?.labNumber === lab
  )?.[0];
  if (!key) throw new Error(`the curriculum of ${group} has no lab number ${lab}`);

  const [module, slug] = key.split('/');
  const path = join(CONTENT, course, module, `${slug}.md`);
  const { data, body } = parseFrontmatter(readFileSync(path, 'utf8'));

  // The variants table of the lab: its rows are handed out to the students
  const section = body.slice(body.indexOf('## Варіанти індивідуальних завдань'));
  const rows = section
    .split('\n')
    .filter(line => /^\|\s*\d+\s*\|/.test(line))
    .map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));

  return { title: data.shortTitle ?? data.title, group: groupEntry, variants: rows };
}

/** Stub of a report: everything known in advance is already filled in */
function reportStub({ course, group, lab, student, labTitle, variant }) {
  const task = variant.length > 1
    ? `Варіант ${variant[0]}: ${variant.slice(1).join(' — ')}`
    : `Варіант ${variant[0]}`;

  return `---
course: ${course}
group: ${group}
lab: ${lab}
student: "${student.name}"
number: ${student.number}
variant: ${variant[0]}
---

<!--
  ${labTitle}
  ${task}

  Тему, мету й обладнання писати не треба — конвеєр візьме їх із лабораторної.
  Знімки екрана кладіть у assets/, вихідний код — у src/.
  Контрольні питання — лише одного рівня, того, на який захищаєте роботу:
  заголовок «### Достатній рівень», далі «1 Текст питання?» і відповідь.
  Покрокова інструкція — reports/README.md
-->

## Хід роботи

1 

## Відповіді на контрольні питання

1 

## Висновок

`;
}

function main() {
  const args = Object.fromEntries(
    process.argv.slice(2)
      .filter(arg => arg.startsWith('--'))
      .map(arg => arg.slice(2).split('='))
  );

  for (const key of ['course', 'group', 'lab']) {
    if (!args[key]) throw new Error(`--${key} is required`);
  }

  const lab = Number(args.lab);
  const { title, variants } = findLab(args.course, args.group, lab);

  const groupDir = join(REPORTS, args.course, 'groups', args.group);
  const listPath = join(groupDir, 'students.json');
  if (!existsSync(listPath)) throw new Error(`no student list at ${relative(ROOT, listPath)}`);

  const group = JSON.parse(readFileSync(listPath, 'utf8'));
  const labDir = join(groupDir, 'labs', String(lab).padStart(2, '0'), 'students');

  let created = 0;
  for (const student of group.students) {
    // The folder is the student's position in the group: the same number that
    // goes into the work code on the title page. A GitHub login would tie the
    // path to an account the student may not have on the day work is opened.
    const folder = String(student.number).padStart(2, '0');
    const dir = join(labDir, folder);

    if (existsSync(join(dir, 'report.md'))) {
      console.log(`[skip] ${folder} — report.md already exists`);
      continue;
    }

    mkdirSync(join(dir, 'assets'), { recursive: true });
    mkdirSync(join(dir, 'src'), { recursive: true });

    // Variants wrap around when a group is larger than the table
    const variant = variants[(student.number - 1) % variants.length];

    writeFileSync(join(dir, 'report.md'), reportStub({
      course: args.course,
      group: args.group,
      lab,
      student,
      labTitle: title,
      variant
    }));

    // Git does not track empty directories
    writeFileSync(join(dir, 'assets', '.gitkeep'), '');
    writeFileSync(join(dir, 'src', '.gitkeep'), '');
    created++;
  }

  console.log(`\n${title} — lab ${lab}, group ${args.group}`);
  console.log(`Folders created: ${created} of ${group.students.length}`);
  console.log(`Path: ${relative(ROOT, labDir)}`);
}

try {
  main();
} catch (error) {
  // The teacher runs this by hand: a message is more useful than a stack trace
  console.error(`[error] ${error.message}`);
  process.exit(1);
}
