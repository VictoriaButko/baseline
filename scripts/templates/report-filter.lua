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
      питання?".

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
