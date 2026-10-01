--[[
  Pandoc filter for student reports (scripts/build-report-docx.mjs).

  The student writes plain markdown; the filter reshapes it to the report
  sample, data/Зразок оформлення для звіту.docx:

    * "## Висновок" is not a heading in the sample: the word runs into the first
      paragraph of the conclusion, "Висновок: текст...";
    * a figure is the picture on a centred line of its own and the caption
      under it, not the one-cell table Pandoc 3 wraps a figure in;
    * "Таблиця N – Назва" above a table is a caption, flush left at the
      paragraph indent;
    * "double quotes" become «ялинки», the quotes of Ukrainian text;
    * a control question written "1 Текст питання?" is numbered "1. Текст
      питання?";
    * superscript and subscript characters typed as Unicode — "2⁸³", "H₂O" —
      become ordinary digits raised or lowered by Word. Times New Roman has
      no glyphs for most of them, and a renderer that meets one falls back to
      another font, which the PDF check rejects.

  Spacing and alignment come from the styles of report-template.docx; the
  filter only says which paragraph is which.
]]

local CONCLUSION = 'Висновок'
local ANSWERS = 'Відповіді на контрольні питання'

--- The number a paragraph opens with, if it is written "1 Текст" or "1. Текст"
local function leading_number(para)
  local first, second = para.content[1], para.content[2]
  if not first or first.t ~= 'Str' then return nil end

  local number, dot = first.text:match('^(%d+)(%.?)$')
  if not number or not second or second.t ~= 'Space' then return nil end
  return tonumber(number), dot == '.'
end

local function styled(style, blocks)
  return pandoc.Div(blocks, { ['custom-style'] = style })
end

local function trimmed(text)
  return (text:gsub('^%s*(.-)%s*$', '%1'))
end

-- Unicode superscripts and subscripts → the plain character they stand for.
-- ¹²³ are in Times New Roman, the rest are not; all of them are converted so
-- that "2¹⁶⁷" is set in one way, not half in glyphs and half in raised digits.
local SUPERSCRIPT = {
  ['⁰'] = '0', ['¹'] = '1', ['²'] = '2', ['³'] = '3', ['⁴'] = '4',
  ['⁵'] = '5', ['⁶'] = '6', ['⁷'] = '7', ['⁸'] = '8', ['⁹'] = '9',
  ['⁺'] = '+', ['⁻'] = '-', ['⁼'] = '=', ['⁽'] = '(', ['⁾'] = ')',
  ['ⁿ'] = 'n', ['ⁱ'] = 'i'
}
local SUBSCRIPT = {
  ['₀'] = '0', ['₁'] = '1', ['₂'] = '2', ['₃'] = '3', ['₄'] = '4',
  ['₅'] = '5', ['₆'] = '6', ['₇'] = '7', ['₈'] = '8', ['₉'] = '9',
  ['₊'] = '+', ['₋'] = '-', ['₌'] = '=', ['₍'] = '(', ['₎'] = ')',
  ['ₐ'] = 'a', ['ₑ'] = 'e', ['ₒ'] = 'o', ['ₓ'] = 'x', ['ₕ'] = 'h',
  ['ₖ'] = 'k', ['ₗ'] = 'l', ['ₘ'] = 'm', ['ₙ'] = 'n', ['ₚ'] = 'p',
  ['ₛ'] = 's', ['ₜ'] = 't'
}

--- Which script a character is set in: 'super', 'sub' or nil for the baseline
local function script_of(char)
  if SUPERSCRIPT[char] then return 'super' end
  if SUBSCRIPT[char] then return 'sub' end
  return nil
end

--- "2⁸³" → Str "2", Superscript [Str "83"]; a word without such characters is
--- left untouched. Code is not a Str and keeps whatever the student typed.
function Str(str)
  local chars = {}
  local has_script = false
  for _, code in utf8.codes(str.text) do
    local char = utf8.char(code)
    chars[#chars + 1] = char
    if script_of(char) then has_script = true end
  end
  if not has_script then return nil end

  local inlines = pandoc.List()
  local run, run_script = {}, nil

  local function flush()
    if #run == 0 then return end
    local text = pandoc.Str(table.concat(run))
    if run_script == 'super' then
      inlines:insert(pandoc.Superscript({ text }))
    elseif run_script == 'sub' then
      inlines:insert(pandoc.Subscript({ text }))
    else
      inlines:insert(text)
    end
    run = {}
  end

  for _, char in ipairs(chars) do
    local script = script_of(char)
    if script ~= run_script then
      flush()
      run_script = script
    end
    run[#run + 1] = SUPERSCRIPT[char] or SUBSCRIPT[char] or char
  end
  flush()

  return inlines
end

--- "Прізвище" → «Прізвище»; single quotes stay as they are — in Ukrainian
--- text they are apostrophes far more often than quotes
function Quoted(quoted)
  if quoted.quotetype ~= 'DoubleQuote' then return nil end

  local inlines = pandoc.List({ pandoc.Str('«') })
  inlines:extend(quoted.content)
  inlines:insert(pandoc.Str('»'))
  return inlines
end

--- The picture and its caption as two paragraphs. The caption is the alt text
--- of the image, the way the report template tells the student to write it:
--- ![Рисунок 1 - Що показано](assets/01.png)
function Figure(figure)
  local images = {}
  figure.content:walk({
    Image = function(image) images[#images + 1] = image end
  })
  if #images == 0 then return nil end

  local blocks = {}
  for _, image in ipairs(images) do
    -- the size comes from the file; the alt text is the caption below
    blocks[#blocks + 1] = styled('Figure', { pandoc.Para({ pandoc.Image({}, image.src, '') }) })
  end

  local caption = pandoc.utils.blocks_to_inlines(figure.caption.long)
  if #caption > 0 then
    blocks[#blocks + 1] = styled('ImageCaption', { pandoc.Para(caption) })
  end

  return blocks
end

--- Walks the top level: captions above tables, and the conclusion heading
--- folded into the paragraph that follows it
function Pandoc(doc)
  local blocks = pandoc.List()
  local source = doc.blocks
  local i = 1

  -- In the answers, a question is the paragraph that opens with the next
  -- number: 1, then 2, then 3. Counting keeps an answer that happens to begin
  -- with a number ("8 символів дають...") from being taken for a question.
  local in_answers = false
  local next_question = 1

  while i <= #source do
    local block = source[i]
    local following = source[i + 1]

    if block.t == 'Header' and block.level <= 2 then
      in_answers = trimmed(pandoc.utils.stringify(block)) == ANSWERS
      next_question = 1
    elseif block.t == 'Header' and in_answers then
      next_question = 1   -- a level heading starts its own numbering
    end

    local number, dotted = nil, false
    if in_answers and block.t == 'Para' then
      number, dotted = leading_number(block)
    elseif in_answers and block.t == 'OrderedList' then
      -- "1. Питання" is a Markdown list, numbered by Word: its items are
      -- questions too, and the count goes on after them
      local start = block.listAttributes and block.listAttributes.start or block.start or 1
      if start == next_question then next_question = next_question + #block.content end
    end

    if number and number == next_question then
      if not dotted then block.content[1] = pandoc.Str(number .. '.') end
      next_question = next_question + 1
      blocks:insert(block)

    elseif block.t == 'Para' and following and following.t == 'Table'
        and pandoc.utils.stringify(block):match('^Таблиця%s+%d+') then
      blocks:insert(styled('TableCaption', { block }))

    elseif block.t == 'Header'
        and trimmed(pandoc.utils.stringify(block)):gsub('[:.]$', '') == CONCLUSION then
      local lead = pandoc.List({ pandoc.Strong({ pandoc.Str(CONCLUSION .. ':') }) })

      if following and following.t == 'Para' then
        lead:insert(pandoc.Space())
        lead:extend(following.content)
        i = i + 1
      end
      blocks:insert(styled('Conclusion', { pandoc.Para(lead) }))

    else
      blocks:insert(block)
    end

    i = i + 1
  end

  doc.blocks = blocks
  return doc
end
