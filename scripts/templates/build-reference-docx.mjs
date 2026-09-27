#!/usr/bin/env node
/**
 * Builds scripts/templates/lab-template.docx — the Pandoc reference document
 * that defines the visual style of generated lab .docx files.
 *
 * The style spec is taken from the reference documents in data/:
 *   ЛР1_ОС_Середовище_Windows.docx, ЛР2_ОС_Файли_та_каталоги_CMD.docx,
 *   ЛР1_ПМЗІ_Шифр_Цезаря.docx
 *
 *   page      A4, margins 20/14.2/20/28.4 mm (top/right/bottom/left)
 *   body      Times New Roman 14pt, line 1.3, justified, first line indent 1.25 cm
 *   headings  level 2 — centered bold; level 3+ — left bold with body indent
 *   code      Courier New 9pt, line 200, left aligned, in a one-cell table
 *             that frames and fills the listing; wrapped lines get a hanging
 *             indent
 *   tables    Times New Roman 12pt, single borders, bold centered header row
 *   lists     see LIST_GEOMETRY in scripts/generate-docx.js — Pandoc builds its
 *             own numbering definitions, so list geometry is patched afterwards
 *
 * Usage: node scripts/templates/build-reference-docx.mjs
 */

import { spawnSync } from 'child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

import { freezeTimestamps, packDocx } from '../lib/docx.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// The earliest a zip entry can be dated; the value itself carries no meaning
const EPOCH = Date.UTC(1980, 0, 1) / 1000;

// A blank line of the report sample — "1 Enter (2 міжрядковий інтервал)" in its
// notes: one empty paragraph of Times New Roman 14pt at line 1.5, 24pt high
const BLANK_LINE = 480;

// The two documents follow different samples:
//   lab    — guides (data/ЛР1_ОС_Середовище_Windows.docx and the others):
//            margins 20/14.2/20/28.4 mm, line 1.3, indent 1.25 cm, captions
//            centred, header row of a table in bold, no page numbers
//   report — student report (data/Зразок оформлення для звіту.docx):
//            margins 20/10/20/25 mm, line 1.5, indent 1 cm, a blank line
//            around headings and figures, table caption flush left with the
//            indent, header row of a table in plain type, the page number in
//            the top right corner of every page but the title page
const PROFILES = {
  lab: {
    output: 'lab-template.docx',
    line: 312,
    margins: { top: 1134, right: 851, bottom: 1134, left: 1418 },
    indent: 709,
    heading: { before: 240, after: 120 },
    figure: { before: 160, between: 60, caption: 60, after: 160 },
    tableCaption: { before: 160, after: 60, jc: 'center', ind: '<w:ind w:firstLine="0"/>' },
    tableHeaderBold: true,
    pageNumbers: false
  },
  report: {
    output: 'report-template.docx',
    line: 360,
    margins: { top: 1134, right: 567, bottom: 1134, left: 1418 },
    indent: 567,
    heading: { before: BLANK_LINE, after: BLANK_LINE },
    figure: { before: BLANK_LINE, between: BLANK_LINE, caption: 0, after: BLANK_LINE },
    // "Таблиця 1 – Назва" starts at the paragraph indent, and a second line of
    // a long name continues under the name rather than under "Таблиця"
    tableCaption: { before: BLANK_LINE, after: 0, jc: 'left', ind: '<w:ind w:left="2127" w:hanging="1560"/>' },
    tableHeaderBold: false,
    pageNumbers: true
  }
};

// --- style spec (twips) ----------------------------------------------------

const BODY_FONT = 'Times New Roman';
const CODE_FONT = 'Courier New';
const BODY_SIZE = 28;   // 14pt
const TABLE_SIZE = 24;  // 12pt
const CODE_SIZE = 18;   // 9pt
let LINE = 312;         // line spacing of the profile being built
let PROFILE = PROFILES.lab;  // the profile being built
const CODE_LINE = 200;  // single spacing in code blocks
const LIST_LEFT = 1134; // 2 cm — used by BlockText
const CODE_WRAP = 340;  // offset of a wrapped code line, so it is not read as the next line
const CODE_PAD = 113;   // 0.2 cm between the frame of a listing and its text
const CODE_FRAME = 'BFBFBF';  // frame of a listing
const CODE_FILL = 'F4F4F4';   // fill of a listing — the print equivalent of the
                              // dark code block the site shows

const fonts = (name) =>
  `<w:rFonts w:ascii="${name}" w:hAnsi="${name}" w:cs="${name}" w:eastAsia="${name}"/>`;

const spacing = (before, after, line) =>
  `<w:spacing w:before="${before}" w:after="${after}" w:line="${line}" w:lineRule="auto"/>`;

const border = (side) => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="000000"/>`;
const allBorders = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(border).join('');

// Paragraph style: centered bold section heading ("Теоретичні відомості")
const sectionHeading = (id, name, before, after) => `
<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:next w:val="FirstParagraph"/><w:qFormat/>
<w:pPr><w:keepNext/>${spacing(before, after, LINE)}<w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:b/><w:bCs/><w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`;

// Paragraph style: left bold subsection heading ("1 Основні поняття", "Крок 1. ...")
const subHeading = (id, name, before) => `
<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:next w:val="FirstParagraph"/><w:qFormat/>
<w:pPr><w:keepNext/>${spacing(before, 0, LINE)}<w:ind w:firstLine="${PROFILE.indent}"/><w:jc w:val="left"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:b/><w:bCs/><w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`;

const buildStyles = () => ({
  Normal: `
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/>
<w:pPr>${spacing(0, 0, LINE)}<w:jc w:val="left"/></w:pPr></w:style>`,

  BodyText: `
<w:style w:type="paragraph" w:styleId="BodyText"><w:name w:val="Body Text"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr>${spacing(0, 0, LINE)}<w:ind w:firstLine="${PROFILE.indent}"/><w:jc w:val="both"/></w:pPr></w:style>`,

  FirstParagraph: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="FirstParagraph"><w:name w:val="First Paragraph"/><w:basedOn w:val="BodyText"/><w:next w:val="BodyText"/><w:qFormat/></w:style>`,

  // Pandoc gives this style both to list items and to table cells, so it must
  // not fix the alignment: cells then follow the table style (left, centred in
  // the header row) and list items are justified by scripts/generate-docx.js.
  // The left offset of a list comes from its numbering definition.
  Compact: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="Compact"><w:name w:val="Compact"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr>${spacing(0, 0, LINE)}<w:ind w:firstLine="0"/><w:contextualSpacing/></w:pPr></w:style>`,

  Title: `
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Subtitle"/><w:qFormat/>
<w:pPr>${spacing(0, 120, LINE)}<w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`,

  Subtitle: `
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:next w:val="FirstParagraph"/><w:qFormat/>
<w:pPr>${spacing(0, 240, LINE)}<w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:b/><w:bCs/><w:caps/><w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`,

  Heading1: sectionHeading('Heading1', 'heading 1', PROFILE.heading.before, PROFILE.heading.after),
  Heading2: sectionHeading('Heading2', 'heading 2', PROFILE.heading.before, PROFILE.heading.after),
  Heading3: subHeading('Heading3', 'heading 3', 140),
  Heading4: subHeading('Heading4', 'heading 4', 120),
  Heading5: subHeading('Heading5', 'heading 5', 120),
  Heading6: subHeading('Heading6', 'heading 6', 120),

  // Listings are set in Courier New 9pt with line spacing 200, as in the
  // reference documents; the frame around them is this project's own addition,
  // for the sake of the site, where a code block is a block of its own.
  //
  // One line of code is one paragraph, as in the samples (see formatListings in
  // scripts/lib/docx.mjs). The hanging indent is the only addition: a line too
  // long for the column continues further right instead of at the first column,
  // where it would read as the next statement.
  SourceCode: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="SourceCode"><w:name w:val="Source Code"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr>${spacing(0, 0, CODE_LINE)}<w:ind w:left="${CODE_WRAP}" w:right="0" w:hanging="${CODE_WRAP}"/><w:jc w:val="left"/></w:pPr>
<w:rPr>${fonts(CODE_FONT)}<w:sz w:val="${CODE_SIZE}"/><w:szCs w:val="${CODE_SIZE}"/></w:rPr></w:style>`,

  // The frame is a one-cell table rather than paragraph borders: Word joins the
  // borders of consecutive paragraphs into one box, but the previewers this
  // document is opened in draw them line by line. A table is a box everywhere,
  // and it breaks across pages without losing its sides.
  //
  // No rPr and no conditional formatting here — the cell takes its font from
  // the SourceCode paragraphs inside it, and a listing has no header row.
  SourceCodeTable: `
<w:style w:type="table" w:customStyle="1" w:styleId="SourceCodeTable"><w:name w:val="Source Code Table"/><w:basedOn w:val="TableNormal"/><w:qFormat/>
<w:tblPr><w:tblInd w:w="0" w:type="dxa"/>
<w:tblBorders>${['top', 'left', 'bottom', 'right'].map(side => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="${CODE_FRAME}"/>`).join('')}</w:tblBorders>
<w:shd w:val="clear" w:color="auto" w:fill="${CODE_FILL}"/>
<w:tblCellMar><w:top w:w="${CODE_PAD}" w:type="dxa"/><w:left w:w="${CODE_PAD}" w:type="dxa"/><w:bottom w:w="${CODE_PAD}" w:type="dxa"/><w:right w:w="${CODE_PAD}" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>`,

  // Inline `code` keeps the body font, as in the reference documents.
  VerbatimChar: `
<w:style w:type="character" w:customStyle="1" w:styleId="VerbatimChar"><w:name w:val="Verbatim Char"/><w:basedOn w:val="DefaultParagraphFont"/>
<w:rPr>${fonts(BODY_FONT)}</w:rPr></w:style>`,

  // "Таблиця 1 — ..." above a table
  TableCaption: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="TableCaption"><w:name w:val="Table Caption"/><w:basedOn w:val="Normal"/><w:next w:val="FirstParagraph"/><w:qFormat/>
<w:pPr><w:keepNext/>${spacing(PROFILE.tableCaption.before, PROFILE.tableCaption.after, LINE)}${PROFILE.tableCaption.ind}<w:jc w:val="${PROFILE.tableCaption.jc}"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`,

  ImageCaption: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="ImageCaption"><w:name w:val="Image Caption"/><w:basedOn w:val="Normal"/><w:next w:val="FirstParagraph"/><w:qFormat/>
<w:pPr>${spacing(PROFILE.figure.caption, PROFILE.figure.after, LINE)}<w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`,

  // The picture itself; the air between it and its caption is its own
  Figure: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="Figure"><w:name w:val="Figure"/><w:basedOn w:val="Normal"/><w:next w:val="ImageCaption"/><w:qFormat/>
<w:pPr><w:keepNext/>${spacing(PROFILE.figure.before, PROFILE.figure.between, LINE)}<w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr></w:style>`,

  // "Висновок: ..." — the report sample runs the conclusion into its first
  // paragraph rather than giving it a heading, and sets it off by a blank line
  Conclusion: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="Conclusion"><w:name w:val="Conclusion"/><w:basedOn w:val="BodyText"/><w:next w:val="BodyText"/><w:qFormat/>
<w:pPr><w:keepNext/>${spacing(PROFILE.heading.before, 0, LINE)}</w:pPr></w:style>`,

  // Page number in the header, top right, as in the report sample
  Header: `
<w:style w:type="paragraph" w:styleId="Header"><w:name w:val="header"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr>${spacing(0, 0, 240)}<w:ind w:firstLine="0"/><w:jc w:val="right"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`,

  BlockText: `
<w:style w:type="paragraph" w:styleId="BlockText"><w:name w:val="Block Text"/><w:basedOn w:val="BodyText"/><w:qFormat/>
<w:pPr>${spacing(0, 0, LINE)}<w:ind w:left="${LIST_LEFT}" w:firstLine="0"/></w:pPr></w:style>`,

  Table: `
<w:style w:type="table" w:default="1" w:styleId="Table"><w:name w:val="Table"/><w:basedOn w:val="TableNormal"/><w:qFormat/>
<w:pPr>${spacing(0, 0, 240)}<w:ind w:firstLine="0"/><w:jc w:val="left"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:sz w:val="${TABLE_SIZE}"/><w:szCs w:val="${TABLE_SIZE}"/></w:rPr>
<w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblBorders>${allBorders}</w:tblBorders>
<w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="70" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr>
<w:tblStylePr w:type="firstRow"><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr>${PROFILE.tableHeaderBold ? '<w:b/><w:bCs/>' : ''}</w:rPr>
<w:tcPr><w:vAlign w:val="center"/></w:tcPr></w:tblStylePr></w:style>`,
});

const docDefaults = () => `<w:docDefaults><w:rPrDefault><w:rPr>${fonts(BODY_FONT)}<w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/><w:lang w:val="uk-UA"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr>${spacing(0, 0, LINE)}</w:pPr></w:pPrDefault></w:docDefaults>`;

// A4 with the margins of the selected profile.
//
// A report numbers its pages the way the sample does: the title page is page 1
// and shows no number (titlePg gives it the empty first-page header), every
// following page has the number in the top right corner, 4 mm from the edge.
// Pandoc carries the headers of the reference document over into the output.
const sectPr = ({ margins: { top, right, bottom, left }, pageNumbers }) =>
  `<w:sectPr>` +
  (pageNumbers
    ? `<w:headerReference w:type="default" r:id="rIdHeaderPage"/>` +
      `<w:headerReference w:type="first" r:id="rIdHeaderFirst"/>`
    : '') +
  `<w:pgSz w:w="11906" w:h="16838" w:orient="portrait"/>` +
  `<w:pgMar w:top="${top}" w:right="${right}" w:bottom="${bottom}" w:left="${left}" ` +
  `w:header="${pageNumbers ? 227 : 708}" w:footer="708" w:gutter="0"/>` +
  `<w:pgNumType w:start="1"/>${pageNumbers ? '<w:titlePg/>' : ''}<w:docGrid w:linePitch="360"/></w:sectPr>`;

const HEADER_NS =
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';

const HEADERS = {
  'header-page.xml': {
    id: 'rIdHeaderPage',
    xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:hdr ${HEADER_NS}>` +
      '<w:p><w:pPr><w:pStyle w:val="Header"/><w:jc w:val="right"/></w:pPr>' +
      '<w:r><w:fldChar w:fldCharType="begin"/></w:r>' +
      '<w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>' +
      '<w:r><w:fldChar w:fldCharType="separate"/></w:r>' +
      '<w:r><w:t>2</w:t></w:r>' +
      '<w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:hdr>'
  },
  'header-first.xml': {
    id: 'rIdHeaderFirst',
    xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:hdr ${HEADER_NS}>` +
      '<w:p><w:pPr><w:pStyle w:val="Header"/></w:pPr></w:p></w:hdr>'
  }
};

const HEADER_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml';
const HEADER_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header';

/** Writes the page-number headers into an unpacked reference document */
function addHeaders(docx) {
  const typesPath = join(docx, '[Content_Types].xml');
  const relsPath = join(docx, 'word', '_rels', 'document.xml.rels');
  let types = readFileSync(typesPath, 'utf8');
  let rels = readFileSync(relsPath, 'utf8');

  for (const [file, { id, xml }] of Object.entries(HEADERS)) {
    writeFileSync(join(docx, 'word', file), xml);
    if (!types.includes(`/word/${file}`)) {
      types = types.replace('</Types>', `<Override PartName="/word/${file}" ContentType="${HEADER_TYPE}"/></Types>`);
    }
    if (!rels.includes(`Id="${id}"`)) {
      rels = rels.replace('</Relationships>', `<Relationship Id="${id}" Type="${HEADER_REL}" Target="${file}"/></Relationships>`);
    }
  }

  writeFileSync(typesPath, types);
  writeFileSync(relsPath, rels);
}

// --- build -----------------------------------------------------------------

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (res.status !== 0) {
    throw new Error(`${cmd} failed: ${res.stderr || res.stdout}`);
  }
  return res.stdout;
}

function patchStyles(xml) {
  let out = xml.replace(/<w:docDefaults>[\s\S]*?<\/w:docDefaults>/, docDefaults());

  for (const [id, definition] of Object.entries(buildStyles())) {
    const existing = new RegExp(
      `<w:style [^>]*w:styleId="${id}"[^>]*>[\\s\\S]*?</w:style>`
    );
    const compact = definition.replace(/\n\s*/g, '');
    out = existing.test(out)
      ? out.replace(existing, compact)
      : out.replace('</w:styles>', `${compact}</w:styles>`);
  }

  // Heading character styles inherit Word's blue theme colour — drop them so
  // nothing in the document can pick it up.
  out = out.replace(/<w:color w:val="2F5496"[^/]*\/>/g, '');
  return out;
}

function buildTemplate(profile) {
  LINE = profile.line;
  PROFILE = profile;

  const work = mkdtempSync(join(tmpdir(), 'reference-docx-'));

  try {
    const base = join(work, 'base.docx');
    writeFileSync(base, run('pandoc', ['--print-default-data-file', 'reference.docx'], {
      encoding: 'buffer',
    }));
    run('unzip', ['-o', '-q', base, '-d', join(work, 'docx')]);

    const stylesPath = join(work, 'docx', 'word', 'styles.xml');
    writeFileSync(stylesPath, patchStyles(readFileSync(stylesPath, 'utf8')));

    const docPath = join(work, 'docx', 'word', 'document.xml');
    const document = readFileSync(docPath, 'utf8').replace(
      /<w:sectPr[\s\S]*?<\/w:sectPr>/,
      sectPr(profile)
    );
    writeFileSync(docPath, document);

    if (profile.pageNumbers) addHeaders(join(work, 'docx'));

    // A .docx is a zip, and a zip stores the modification time of every entry.
    // Without freezing them a rebuild of an unchanged template differs byte for
    // byte from the last one, so both templates show up as modified on every
    // run. Unlike a guide or a report, a template is not a document anybody
    // reads a date off — it is an input of the build — so the stamp is a
    // constant rather than the date of a commit. The template then depends on
    // this file alone, and rebuilding it twice, or on another machine, gives
    // the same bytes.
    freezeTimestamps(join(work, 'docx'), EPOCH);

    const output = join(__dirname, profile.output);
    const built = join(work, profile.output);
    packDocx(join(work, 'docx'), built);
    copyFileSync(built, output);

    console.log(`[ok] ${output}`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

for (const profile of Object.values(PROFILES)) {
  buildTemplate(profile);
}
