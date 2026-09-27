#!/usr/bin/env node
/**
 * Rebuilds scripts/templates/report-title-<course>.xml from the samples in data/.
 *
 * Run it after the sample itself changes (a new year, a different teacher in the
 * signature). The script drops the authoring note that carries the only image and
 * puts placeholders where the variable values are.
 *
 * Usage: node scripts/templates/build-report-title.mjs
 */

import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// Every course has its own title-page sample: the discipline, the work code and
// even the year differ ("2026" for OS, "2026 - 2027" for the security course).
const COURSES = [
  {
    id: '01-operating-systems',
    source: 'Титулка_ЛР_ОС_ПЗ-25.docx',
    substitutions: [
      ['З ЛАБОРАТОРНОЇ РОБОТИ №1', 'З ЛАБОРАТОРНОЇ РОБОТИ №{{lab}}'],
      ['ОПЕРАЦІЙНІ СИСТЕМИ', '{{discipline}}'],
      ['ФКЗЕ. 121ОСXX. 02ЛР / ФКЗЕ. F2ОСXX. 02ЛР', '{{code}}'],
      ['Студент    ________________________', 'Студент    {{student}}'],
      ['ПЗ-25-1/9', '{{group}}'],
      ['Костенко А.О.', '{{teacher}}'],
      ['2026', '{{year}}']
    ]
  },
  {
    id: '02-software-security-methods',
    source: 'Титульний_Лист_ЛР_ПМЗІ_ПЗ-23.docx',
    substitutions: [
      ['З ЛАБОРАТОРНОЇ РОБОТИ №1', 'З ЛАБОРАТОРНОЇ РОБОТИ №{{lab}}'],
      ['ПРОГРАМНІ МЕТОДИ ЗАХИСТУ ІНФОРМАЦІЇ', '{{discipline}}'],
      ['ФКЗЕ. 121ПМЗІXX. 01ЛР', '{{code}}'],
      ['Студент    ________________________', 'Студент    {{student}}'],
      ['ПЗ-23-1/9', '{{group}}'],
      ['Костенко А.О.', '{{teacher}}'],
      ['2026 - 2027', '{{academicYear}}']
    ]
  }
];

// The authoring note "4 пробіл, нижнє підкреслення" is the only paragraph that
// carries an image; the generated title page does not include it
const NOTE = '4 пробіл, нижнє підкреслення';

// The sample is a Google Docs export: every paragraph carries w14:paraId, whose
// namespace lives on the <w:document> of the sample. Inlined into a Pandoc
// document that declares no w14, the attribute makes document.xml malformed and
// Word refuses the file. The rsid attributes are all zeros and mean nothing.
const stripAttributes = xml => xml.replace(/\s(?:w14:\w+|w:rsid\w*)="[^"]*"/g, '');

/**
 * The sample's note asks for four spaces and then the name underlined, the way
 * the group and the teacher are. The name is split into a run of its own that
 * repeats the formatting of the label and adds the underline.
 */
function underlineStudent(body) {
  const run = /<w:r>(<w:rPr>(?:(?!<\/w:rPr>)[\s\S])*<\/w:rPr>)<w:t xml:space="preserve">(Студент\s+){{student}}<\/w:t><\/w:r>/;
  if (!run.test(body)) throw new Error('no run "Студент {{student}}" to underline');

  return body.replace(run, (match, properties, label) => {
    // the schema orders rPr children: <w:u> comes after the size and before <w:rtl>
    const underlined = properties.includes('<w:rtl')
      ? properties.replace('<w:rtl', '<w:u w:val="single"/><w:rtl')
      : properties.replace('</w:rPr>', '<w:u w:val="single"/></w:rPr>');
    return `<w:r>${properties}<w:t xml:space="preserve">${label}</w:t></w:r>` +
      `<w:r>${underlined}<w:t xml:space="preserve">{{student}}</w:t></w:r>`;
  });
}

const header = source => `<!--
  Title page of a lab report.

  Extracted from data/${source}: paragraphs with direct formatting, no named
  styles and no images. Pandoc inserts this fragment into the document as a raw
  {=openxml} block, so no two .docx files have to be merged.

  Placeholders: {{lab}} {{discipline}} {{code}} {{student}} {{group}} {{teacher}}
                {{year}} {{academicYear}}
  Rebuild after a sample changes: node scripts/templates/build-report-title.mjs
-->
`;

function buildTitle({ id, source, substitutions }) {
  const work = mkdtempSync(join(tmpdir(), 'report-title-'));

  try {
    execFileSync('unzip', ['-o', '-q', join(ROOT, 'data', source), 'word/document.xml', '-d', work]);
    const xml = readFileSync(join(work, 'word', 'document.xml'), 'utf8');

    const paragraphs = xml.match(/<w:p\b[\s\S]*?<\/w:p>/g) ?? [];
    const kept = paragraphs.filter(paragraph => !paragraph.includes(NOTE));

    if (kept.some(p => p.includes('<w:drawing>') || p.includes('<w:pict>'))) {
      throw new Error(`${source}: an image is left in the title page — it cannot be inlined this way`);
    }

    let body = stripAttributes(kept.join('\n'));
    for (const [from, to] of substitutions) {
      if (!body.includes(from)) throw new Error(`${source}: no line "${from}"`);
      body = body.replaceAll(from, to);
    }
    body = underlineStudent(body);

    const output = join(__dirname, `report-title-${id}.xml`);
    writeFileSync(output, header(source) + body + '\n');
    console.log(`[ok] ${output} — ${kept.length} paragraphs`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

for (const course of COURSES) {
  buildTitle(course);
}
