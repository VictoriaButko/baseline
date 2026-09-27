/**
 * Shared part of the .docx generators: running Pandoc and the post-processing
 * that a reference document cannot carry.
 *
 * Pandoc writes numbering.xml itself and sizes tables from the markdown source,
 * so list and table geometry has to be patched into the finished file. Lab
 * guides and student reports differ only in text width and indents, so those
 * values are passed in as parameters.
 */

import { spawnSync } from 'child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { tmpdir } from 'os';

// Pandoc reader and writer options shared by every conversion.
// Highlighting is off: printed documents show code in plain black.
export const PANDOC_ARGS = [
  '--from=markdown+yaml_metadata_block+pipe_tables+fenced_code_blocks+task_lists+raw_attribute',
  '--to=docx',
  '--wrap=none',
  '--standalone',
  '--no-highlight'
];

/**
 * Environment of touch and zip. A zip entry stores its time as local time,
 * so the same document packed in Kyiv and on a CI runner (UTC) differed by the
 * hours between them. Packing always in UTC gives the same bytes everywhere.
 */
export const ZIP_ENV = { ...process.env, TZ: 'UTC' };

/**
 * Packs an unpacked .docx directory into a zip that is the same bytes on every
 * machine: entries in byte order of their names ([Content_Types].xml first, as
 * Word expects), no directory entries, no extra attributes, times in UTC.
 * zip -r lists a directory in the order the file system returns it, which is
 * sorted on macOS and not on the ext4 of a CI runner.
 */
export function packDocx(directory, outputPath) {
  const files = [];
  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const name = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(join(dir, entry.name), name);
      else files.push(name);
    }
  };
  walk(directory, '');
  files.sort((a, b) => (Buffer.compare(Buffer.from(a), Buffer.from(b))));

  rmSync(outputPath, { force: true });
  const result = spawnSync('zip', ['-q', '-X', '-D', outputPath, '-@'], {
    cwd: directory, input: files.join('\n') + '\n', encoding: 'utf8', env: ZIP_ENV
  });
  if (result.status !== 0) throw new Error(`zip failed: ${result.stderr || result.stdout}`);
}

/** Runs a command, throwing on a non-zero exit status */
export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });

  if (result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

/**
 * Stretches a table to the text width, keeping the column proportions Pandoc
 * derived from the markdown source.
 */
export function stretchTable(table, tableWidth) {
  const columns = [...table.matchAll(/<w:gridCol w:w="([\d.]+)"\s*\/>/g)].map(m => parseFloat(m[1]));

  const total = columns.reduce((sum, width) => sum + width, 0);
  if (!total) return table;

  const scaled = columns.map(width => Math.round((width / total) * tableWidth));
  scaled[scaled.length - 1] += tableWidth - scaled.reduce((sum, w) => sum + w, 0);

  let index = 0;
  const out = table.replace(/<w:gridCol w:w="[\d.]+"\s*\/>/g, () => `<w:gridCol w:w="${scaled[index++]}"/>`);

  return out.replace(/<w:tblPr>([\s\S]*?)<\/w:tblPr>/, (match, inner) => {
    let properties = setChild(inner, TBL_PR, 'tblW', `<w:tblW w:type="dxa" w:w="${tableWidth}"/>`);
    if (!/<w:tblLayout\b/.test(properties)) {
      properties = setChild(properties, TBL_PR, 'tblLayout', '<w:tblLayout w:type="fixed"/>');
    }
    return `<w:tblPr>${properties}</w:tblPr>`;
  });
}

// Order of the children of <w:pPr> and <w:tblPr> in the OOXML schema. Word
// reads a property written out of order as a damaged file, so an element is
// inserted where the schema puts it rather than appended.
const P_PR = [
  'pStyle', 'keepNext', 'keepLines', 'pageBreakBefore', 'framePr', 'widowControl', 'numPr',
  'suppressLineNumbers', 'pBdr', 'shd', 'tabs', 'suppressAutoHyphens', 'kinsoku', 'wordWrap',
  'overflowPunct', 'topLinePunct', 'autoSpaceDE', 'autoSpaceDN', 'bidi', 'adjustRightInd',
  'snapToGrid', 'spacing', 'ind', 'contextualSpacing', 'mirrorIndents', 'suppressOverlap', 'jc',
  'textDirection', 'textAlignment', 'textboxTightWrap', 'outlineLvl', 'divId', 'cnfStyle', 'rPr',
  'sectPr', 'pPrChange'
];
const TBL_PR = [
  'tblStyle', 'tblpPr', 'tblOverlap', 'bidiVisual', 'tblStyleRowBandSize', 'tblStyleColBandSize',
  'tblW', 'jc', 'tblCellSpacing', 'tblInd', 'tblBorders', 'shd', 'tblLayout', 'tblCellMar',
  'tblLook', 'tblCaption', 'tblDescription', 'tblPrChange'
];

/** The top-level children of a properties element, as [name, xml] pairs */
function children(inner) {
  const out = [];
  const pattern = /<w:(\w+)\b[^>]*?(?:\/>|>[\s\S]*?<\/w:\1>)/g;
  for (const [xml, name] of inner.matchAll(pattern)) out.push([name, xml]);
  return out;
}

/**
 * Sets one child of a properties element: replaces it when present, otherwise
 * inserts it at its place in the schema order. The other children keep their
 * order — and are put in schema order too if Pandoc wrote them out of it.
 */
export function setChild(inner, order, name, xml) {
  const rank = child => {
    const position = order.indexOf(child);
    return position === -1 ? order.length : position;
  };
  const list = children(inner).filter(([child]) => child !== name);
  list.push([name, xml]);
  return list
    .map((entry, index) => [...entry, index])
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[2] - b[2])
    .map(([, child]) => child)
    .join('');
}

/**
 * Sets the tables of the document (Pandoc's "Table" style — listings are framed
 * later and are not touched) the way the samples print them.
 *
 * Every cell paragraph gets single spacing. Pandoc gives cell paragraphs the
 * Compact style, and a paragraph style outranks the table style, so the single
 * spacing of the Table style never reached the cells: they were set at the
 * 1.3 or 1.5 of the body text.
 *
 * The rest is optional, per document (the report sample):
 *   align       — the table itself, "center"
 *   headerAlign — the header row; Pandoc writes the column alignment into every
 *                 cell, which outranks the centring of the table style
 *   rowHeight   — minimum height of a row, twips
 */
export function formatTable(table, { align, headerAlign, rowHeight } = {}) {
  if (!/<w:tblStyle w:val="Table"\s*\/>/.test(table)) return table;

  const single = '<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>';

  const paragraph = (xml, extra = []) => xml
    .replace(/<w:p>(?!<w:pPr>)/g, '<w:p><w:pPr></w:pPr>')
    .replace(/<w:pPr>([\s\S]*?)<\/w:pPr>/g, (match, inner) => {
      let properties = /<w:spacing\b/.test(inner) ? inner : setChild(inner, P_PR, 'spacing', single);
      for (const [name, value] of extra) properties = setChild(properties, P_PR, name, value);
      return `<w:pPr>${properties}</w:pPr>`;
    });

  let out = table.replace(/<w:tblPr>([\s\S]*?)<\/w:tblPr>/, (match, inner) =>
    `<w:tblPr>${align ? setChild(inner, TBL_PR, 'jc', `<w:jc w:val="${align}"/>`) : inner}</w:tblPr>`
  );

  // Header row alignment is written into every cell: it outranks the table
  // style, and some previewers read nothing else
  out = out.replace(/<w:tr>([\s\S]*?)<\/w:tr>/g, (row, inner) => {
    const header = /<w:tblHeader\b/.test(inner);
    let cells = paragraph(inner, header && headerAlign ? [['jc', `<w:jc w:val="${headerAlign}"/>`]] : []);

    if (rowHeight) {
      const height = `<w:trHeight w:val="${rowHeight}"/>`;
      cells = cells.includes('<w:trPr>')
        ? cells.replace('<w:trPr>', `<w:trPr>${height}`)
        : cells.includes('<w:trPr />') || cells.includes('<w:trPr/>')
          ? cells.replace(/<w:trPr\s*\/>/, `<w:trPr>${height}</w:trPr>`)
          : `<w:trPr>${height}</w:trPr>${cells}`;
    }
    return `<w:tr>${cells}</w:tr>`;
  });

  return out;
}

/**
 * Checks the package before it is written: every XML part must be well formed,
 * and every style and relationship the document refers to must exist.
 *
 * Word refuses a malformed part outright ("the file is corrupt") and quietly
 * falls back to Normal for a style it cannot find, so either failure reaches
 * the printed page. Better to fail the build and never commit such a file.
 */
export function validatePackage(directory) {
  const parts = [];
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(xml|rels)$/.test(entry.name)) parts.push(path);
    }
  };
  walk(directory);

  const lint = spawnSync('xmllint', ['--noout', ...parts], { encoding: 'utf8' });
  if (lint.error) throw new Error('xmllint is not installed (libxml2-utils) — cannot check the document');
  // Namespace errors (a prefix nobody declared) leave the exit status at 0 and
  // are only printed — and they are exactly what made Word refuse a report
  if (lint.status !== 0 || lint.stderr.trim()) {
    const message = lint.stderr.split(directory + '/').join('').trim().split('\n').slice(0, 3).join('\n');
    throw new Error(`malformed XML in the document:\n${message}`);
  }

  const read = path => existsSync(join(directory, path)) ? readFileSync(join(directory, path), 'utf8') : '';
  const styles = new Set([...read('word/styles.xml').matchAll(/w:styleId="([^"]+)"/g)].map(m => m[1]));
  const problems = [];

  for (const part of parts.filter(path => /word\/(document|header\d*|header-\w+|footer\d*)\.xml$/.test(path))) {
    const xml = readFileSync(part, 'utf8');
    const name = relative(directory, part);

    for (const [, kind, id] of xml.matchAll(/<w:(pStyle|rStyle|tblStyle) w:val="([^"]+)"/g)) {
      if (!styles.has(id)) problems.push(`${name}: ${kind} "${id}" is not defined in styles.xml`);
    }

    const relsPath = join('word', '_rels', `${name.split('/').pop()}.rels`);
    const rels = new Set([...read(relsPath).matchAll(/Id="([^"]+)"/g)].map(m => m[1]));
    for (const [, id] of xml.matchAll(/r:(?:id|embed|link)="([^"]+)"/g)) {
      if (!rels.has(id)) problems.push(`${name}: relationship ${id} is missing from ${relsPath}`);
    }
  }

  if (problems.length) {
    throw new Error(`the document refers to what it does not contain:\n${[...new Set(problems)].join('\n')}`);
  }
}

/** Writes the title and the author into docProps/core.xml */
function setProperties(directory, { title, author } = {}) {
  const path = join(directory, 'docProps', 'core.xml');
  if (!existsSync(path) || (!title && !author)) return;

  const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const set = (xml, tag, value) => value === undefined ? xml : xml.replace(
    new RegExp(`<${tag}\\s*/>|<${tag}>[^<]*</${tag}>`),
    `<${tag}>${escape(value)}</${tag}>`
  );

  writeFileSync(path, set(set(readFileSync(path, 'utf8'), 'dc:title', title), 'dc:creator', author));
}

/**
 * Applies the parts of the reference layout a reference document cannot carry:
 * list indents and bullets (Pandoc writes numbering.xml itself), justified list
 * items (Pandoc shares the Compact style with table cells) and full-width
 * tables (Pandoc sizes them from the markdown source).
 */
/**
 * Timestamp every file inside the package gets before it is zipped again.
 *
 * A .docx is a zip, and zip stores the modification time of each entry. Without
 * this the repack writes the current time into every entry, so a regenerated
 * document differs byte for byte from the previous one even when its content is
 * identical — and all 56 guides show up as changed on every run.
 */
export function freezeTimestamps(directory, epoch) {
  const stamp = new Date(Number(epoch) * 1000);
  const pad = value => String(value).padStart(2, '0');

  // touch -t expects CCYYMMDDhhmm.ss
  const formatted = `${stamp.getUTCFullYear()}${pad(stamp.getUTCMonth() + 1)}${pad(stamp.getUTCDate())}` +
                    `${pad(stamp.getUTCHours())}${pad(stamp.getUTCMinutes())}.${pad(stamp.getUTCSeconds())}`;

  run('find', [directory, '-exec', 'touch', '-t', formatted, '{}', '+'], { env: ZIP_ENV });
}

/**
 * Rebuilds the listings Pandoc wrote into the shape the printed page needs.
 *
 * Pandoc marks every run of a code block with the VerbatimChar character style,
 * which it also uses for inline `code`. A character style outranks a paragraph
 * style, so the Courier New of SourceCode never reached the page: listings were
 * set in the proportional body font, and every ASCII frame and every alignment
 * in them collapsed. Inside a listing the style is therefore dropped; inline
 * code keeps it and stays body text, as in the samples.
 *
 * Pandoc also writes a listing as one paragraph with line breaks. Such a
 * paragraph cannot be broken between pages in any controlled way, and a line
 * too long for the column wraps back to the first column, where it reads as the
 * next statement. The samples set one line of code as one paragraph, and so
 * does this: pages may then break between lines, and the hanging indent of
 * SourceCode marks a wrapped line.
 *
 * Those paragraphs then go into a one-cell table, which is what draws the frame.
 * Paragraph borders would do it in Word alone — it joins the borders of
 * consecutive paragraphs into one box, and the previewers this document is
 * opened in draw a rule under every line instead. The frame itself is defined
 * once, by the SourceCodeTable style of the reference document, and written
 * into every table as well — and its fill into the cell, where every renderer
 * looks for it — because a table style is another thing those previewers skip.
 */
function formatListings(document, { line, lineRule, width, borders, fill, cellMargins }) {
  // A table carries no spacing of its own, so the air above and below the frame
  // is an empty paragraph of an exact height
  const spacer =
    '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="120" w:lineRule="exact"/>' +
    '<w:rPr><w:sz w:val="4"/><w:szCs w:val="4"/></w:rPr></w:pPr></w:p>';

  return document.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, paragraph => {
    if (!paragraph.includes('w:val="SourceCode"')) return paragraph;

    const clean = paragraph
      .replace(/<w:rStyle w:val="VerbatimChar"\s*\/>/g, '')
      .replace(/<w:rPr>\s*<\/w:rPr>/g, '');

    const split = clean.match(/^(<w:p\b[^>]*>)(?:<w:pPr>[\s\S]*?<\/w:pPr>)?([\s\S]*)<\/w:p>$/);
    if (!split) return clean;

    const [, opening, body] = split;
    const properties =
      `<w:pPr><w:pStyle w:val="SourceCode"/>` +
      `<w:spacing w:before="0" w:after="0" w:line="${line}" w:lineRule="${lineRule}"/></w:pPr>`;

    const lines = body
      .split(/<w:r>\s*<w:br\s*\/>\s*<\/w:r>/)
      .map(code => `${opening}${properties}${code}</w:p>`)
      .join('');

    return spacer +
      '<w:tbl><w:tblPr><w:tblStyle w:val="SourceCodeTable"/>' +
      `<w:tblW w:type="dxa" w:w="${width}"/><w:tblInd w:w="0" w:type="dxa"/>` +
      `${borders}${fill}<w:tblLayout w:type="fixed"/>${cellMargins}` +
      '<w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="1" w:noVBand="1"/>' +
      `</w:tblPr><w:tblGrid><w:gridCol w:w="${width}"/></w:tblGrid>` +
      `<w:tr><w:tc><w:tcPr><w:tcW w:type="dxa" w:w="${width}"/>${fill}</w:tcPr>${lines}</w:tc></w:tr></w:tbl>` +
      spacer;
  });
}

/**
 * How a listing is set, read from the reference document so that it stays
 * defined in one place only — the style builder in
 * scripts/templates/build-reference-docx.mjs. The line spacing comes from the
 * SourceCode paragraph style, the frame, the fill and the padding from
 * SourceCodeTable.
 */
function listingStyle(stylesXml) {
  const style = id =>
    stylesXml.match(new RegExp(`<w:style [^>]*w:styleId="${id}"[\\s\\S]*?</w:style>`))?.[0] ?? '';

  const spacing = style('SourceCode').match(/<w:spacing\b[^>]*\/>/)?.[0] ?? '';
  const table = style('SourceCodeTable');

  return {
    line: spacing.match(/w:line="(\d+)"/)?.[1] ?? '240',
    lineRule: spacing.match(/w:lineRule="(\w+)"/)?.[1] ?? 'auto',
    borders: table.match(/<w:tblBorders>[\s\S]*?<\/w:tblBorders>/)?.[0] ?? '',
    fill: table.match(/<w:shd\b[^>]*\/>/)?.[0] ?? '',
    cellMargins: table.match(/<w:tblCellMar>[\s\S]*?<\/w:tblCellMar>/)?.[0] ?? ''
  };
}

export function applyReferenceFormatting(docxPath, { tableWidth, list, table, properties, epoch }) {
  const work = mkdtempSync(join(tmpdir(), 'docx-format-'));

  try {
    run('unzip', ['-o', '-q', docxPath, '-d', work]);

    const listing = listingStyle(readFileSync(join(work, 'word', 'styles.xml'), 'utf8'));

    const documentPath = join(work, 'word', 'document.xml');
    const document = readFileSync(documentPath, 'utf8')
      .replace(
        /<w:pPr>(?:(?!<\/w:pPr>)[\s\S])*?<\/w:pPr>/g,
        properties =>
          properties.includes('<w:numPr>') && !properties.includes('<w:jc ')
            ? properties.replace('</w:pPr>', '<w:jc w:val="both"/></w:pPr>')
            : properties
      )
      .replace(/<w:tbl>[\s\S]*?<\/w:tblGrid>/g, grid => stretchTable(grid, tableWidth))
      .replace(/<w:tbl>[\s\S]*?<\/w:tbl>/g, whole => formatTable(whole, table));

    writeFileSync(documentPath, formatListings(document, { ...listing, width: tableWidth }));

    const numberingPath = join(work, 'word', 'numbering.xml');
    const { left, hanging, bullet } = list;
    // Checkbox markers carry meaning; every other bullet glyph Pandoc picks
    // (•, ◦, ▪, Symbol font) becomes the dash used by the reference documents
    const CHECKBOXES = ['☐', '☑', '☒'];

    const patched = !existsSync(numberingPath) ? null : readFileSync(numberingPath, 'utf8').replace(
      /<w:lvl\b[^>]*w:ilvl="(\d+)"[^>]*>[\s\S]*?<\/w:lvl>/g,
      (level, ilvl) => {
        const depth = parseInt(ilvl, 10);
        const isBullet = level.includes('<w:numFmt w:val="bullet"');

        let out = level.replace(
          /<w:ind\b[^/]*\/>/,
          `<w:ind w:left="${left + depth * 567}" w:hanging="${hanging}"/>`
        );

        out = out.replace(/<w:lvlText w:val="([^"]*)"\s*\/>/, (match, glyph) =>
          // A blank glyph is Pandoc's marker for a paragraph that continues a
          // list item (the answer under a numbered question): it has no bullet
          // and must not get one
          isBullet && !CHECKBOXES.includes(glyph) && glyph.trim() !== '' ? `<w:lvlText w:val="${bullet}"/>` : match
        );

        // Symbol / Wingdings are only there for Pandoc's own bullet glyphs
        return out.replace(/<w:rFonts\b[^/]*w:ascii="(Symbol|Wingdings)"[^/]*\s*\/>/, '');
      }
    );

    if (patched !== null) {
      writeFileSync(numberingPath, patched);
    }

    setProperties(work, properties);
    validatePackage(work);

    if (epoch) freezeTimestamps(work, epoch);

    const packed = `${work}.docx`;
    packDocx(work, packed);
    copyFileSync(packed, docxPath);
    rmSync(packed, { force: true });
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/**
 * Timestamp Pandoc writes into the document properties.
 *
 * Without it every run produces a new timestamp, so regenerating the guides
 * marks all 56 files as changed while their content is identical. Taking the
 * date of the last commit that touched the source keeps the document honest and
 * the output reproducible: unchanged material, unchanged file.
 */
export function sourceDateEpoch(sourcePath) {
  const log = spawnSync('git', ['log', '-1', '--format=%ct', '--', sourcePath], { encoding: 'utf8' });
  const committed = log.status === 0 ? log.stdout.trim() : '';

  if (committed) return committed;

  // Not in git yet (a freshly written report): fall back to the file itself
  try {
    return String(Math.floor(statSync(sourcePath).mtimeMs / 1000));
  } catch {
    return String(Math.floor(Date.now() / 1000));
  }
}

/** Converts markdown to .docx against a reference document and patches the result */
export function convert(inputPath, outputPath, { referenceDoc, filter, metadata = {}, layout, properties, cwd, resourcePath, dateFrom }) {
  const args = [inputPath, '-o', outputPath, ...PANDOC_ARGS, `--reference-doc=${referenceDoc}`];

  if (filter) args.push(`--lua-filter=${filter}`);
  // Report images sit next to the report, not in the working directory
  if (resourcePath) args.push(`--resource-path=${resourcePath}`);

  for (const [key, value] of Object.entries(metadata)) {
    args.push('--metadata', `${key}=${value}`);
  }

  const epoch = sourceDateEpoch(dateFrom ?? inputPath);

  const pandoc = spawnSync('pandoc', args, {
    cwd, encoding: 'utf8', env: { ...process.env, SOURCE_DATE_EPOCH: epoch }
  });
  if (pandoc.error || pandoc.status !== 0) {
    throw new Error(`pandoc failed: ${pandoc.error?.message ?? pandoc.stderr}`);
  }

  // A picture Pandoc cannot read is replaced by its alt text and only warned
  // about — the document would go out without it
  const missing = pandoc.stderr.split('\n').filter(line => /Could not (fetch|find|read|determine)/i.test(line));
  if (missing.length) {
    rmSync(outputPath, { force: true });
    throw new Error(`pandoc could not embed a resource:\n${missing.join('\n')}`);
  }

  try {
    applyReferenceFormatting(outputPath, { ...layout, properties, epoch });
  } catch (error) {
    // an invalid document must not be left behind to be committed
    rmSync(outputPath, { force: true });
    throw error;
  }
}
