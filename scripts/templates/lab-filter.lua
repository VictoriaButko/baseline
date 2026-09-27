--[[
  Pandoc filter for lab .docx generation.

  Markdown is the single source for both the web UI and the printable
  methodical guide, so the filter reshapes the document to the layout of the
  reference guides in data/:

    * drops sections that belong to the site only (grading criteria live in a
      separate document, cheat sheets are ASCII art that does not survive
      Word);
    * marks "Таблиця N — ..." / "Рисунок N — ..." paragraphs as captions so
      they are centred above the object instead of being justified body text;
    * "double quotes" become «ялинки»;
    * lists and checkboxes keep the reader's own markers — their geometry is
      patched in scripts/generate-docx.js.
]]

-- Section headings excluded from the .docx. Lua has no Unicode case folding,
-- so Cyrillic titles are listed exactly as they are written in the markdown.
local SKIPPED_SECTIONS = {
  ['Передумови'] = true,
  ['Критерії оцінювання'] = true,
  ['Cheat Sheet'] = true,
  ['Cheat sheet'] = true,
  ['Шпаргалка'] = true,
  ['Додаткові ресурси'] = true,
  ['Приклад звіту'] = true,
}

local function is_skipped(header)
  local text = pandoc.utils.stringify(header):gsub('^%s*(.-)%s*$', '%1')
  return SKIPPED_SECTIONS[text] == true
end

--- "термін" → «термін»: Pandoc sets English quotes, Ukrainian text takes
--- «ялинки». Single quotes stay — in the material they are character literals
--- ('A') and apostrophes, not quotation
function Quoted(quoted)
  if quoted.quotetype ~= 'DoubleQuote' then return nil end

  local inlines = pandoc.List({ pandoc.Str('«') })
  inlines:extend(quoted.content)
  inlines:insert(pandoc.Str('»'))
  return inlines
end

--- "Таблиця 1 — Відповідність команд" → centred caption above the table
function Para(para)
  local text = pandoc.utils.stringify(para)
  local style

  if text:match('^Таблиця%s+%d+%s*[—–-]') then
    style = 'TableCaption'
  elseif text:match('^Рисунок%s+%d+%s*[—–-]') then
    style = 'ImageCaption'
  else
    return nil
  end

  return pandoc.Div({ para }, { ['custom-style'] = style })
end

--- Remove UI-only sections together with everything nested under them.
function Pandoc(doc)
  local blocks = {}
  local skip_from_level = nil

  for _, block in ipairs(doc.blocks) do
    if block.t == 'Header' then
      if skip_from_level and block.level <= skip_from_level then
        skip_from_level = nil
      end
      if not skip_from_level and is_skipped(block) then
        skip_from_level = block.level
      end
    end

    if not skip_from_level then
      blocks[#blocks + 1] = block
    end
  end

  doc.blocks = blocks
  return doc
end
