# baseline

Course site for a Ukrainian technical college: lectures, labs and student reports
live in one repository as markdown, and everything printable is generated from it.

The site is a static SPA on GitHub Pages — there is no backend. Two pipelines turn
the same markdown into Word documents in the format the college requires: teaching
guides for the teacher and lab reports for the students.

| Directory | Contents |
|-----------|----------|
| `content/uk/<course>/` | lectures, labs and self-study topics — the source of both the site and the guides |
| `public/labs/` | generated teaching guides (.docx), one set per group |
| `reports/` | student reports and the .docx built from them — see [reports/README.md](reports/README.md) |
| `scripts/` | .docx generation and verification of the code examples |
| `data/` | curricula, formatting samples, the report title page |

```bash
npm run dev               # run the site locally
npm run build             # type-check and build the site
npm run generate:labs     # teaching guides (.docx) from content/
npm run verify:examples   # build and run every code example in the materials
npm run build:report -- reports/<path>/report.md   # build one student report
```

## Courses and curricula

Two subjects are taught to five groups at once, and the groups do not follow the
same curriculum. The same lab is number 11 for one group and number 5 for another,
takes four hours here and two hours there, and a topic read as a lecture to one
group is self-study for the next.

That difference lives in `content/uk/<course>/_programs.json`, built from the
curricula in `data/`. A material carries no group-specific data of its own: the
roadmap, the guides and the report title pages all read the numbers from there.
Adding a group is one entry in that file.

## Content

Every lecture, lab and self-study topic is a markdown file with frontmatter that
states its type, its position in the module and — for labs — the equipment and the
official title from the curriculum. Sections follow a fixed skeleton, and a few
markup rules exist only because the .docx conversion depends on them: a blank line
before every list and table, a caption paragraph above each table, code in fenced
blocks with a language.

Code examples in the materials are not decorative. `npm run verify:examples`
extracts every C++ block, builds and runs it, and compares the real output with
what the material claims. Blocks of one topic complement each other, and a missing
implementation is looked up across the subject — the same way a student would
follow "take sha256 from lab 7". The same command checks markup defects that have
bitten before: Cyrillic inside Latin words, hashes of the wrong length, ragged
ASCII frames.

## Quiz answer keys

The answer key of a quiz lies next to its lecture as `<lecture>.answers`. The
repository is public, so git ignores the plaintext and tracks
`<lecture>.answers.age` — the same file encrypted with
[age](https://age-encryption.org) to the public key in `.age-recipients`.

The secret key is in Passwords (entry "baseline — quiz answers key"). On a new
machine it is copied out of there once, and every worktree finds it in
`~/.config/baseline/answers.key`:

```bash
pbpaste | npm run answers:import-key   # or $BASELINE_AGE_KEY for a one-off run
npm run answers:decrypt                # *.answers.age → *.answers
# edit the answers
npm run answers:encrypt                # changed files only, then commit the .age
npm run answers:status                 # what is not encrypted yet
```

`decrypt` never overwrites an answer key with local edits that are not encrypted
yet; `--force` does. CI runs `npm run answers:check` on every push: it fails on a
tracked plaintext answer key or a secret key anywhere in the repository.

The ciphertext stays in git history for good. If the secret key leaks, a new key
protects only future edits — the leaked answers can be fixed only by changing the
questions.

## Documents

Both pipelines share `scripts/lib/docx.mjs`: Pandoc plus the post-processing that
a reference document cannot carry (list geometry, full-width tables). They differ
only in the reference document and the page geometry.

- **Teaching guides** — `npm run generate:labs`. One set per group, with that
  group's lab number on the title and its hours in the text.
- **Student reports** — built in CI when a pull request is merged into a `lab/**`
  branch. The title page comes from the sample in `data/` as a raw OOXML template;
  the topic, the aim and the equipment are taken from the lab material, so a
  student writes only the procedure, the answers and the conclusion.

Pandoc is required for both: `brew install pandoc` or `apt install pandoc`.

## Language

Code, comments and tooling output are in English. Ukrainian is the language of the
content: the materials, the site interface, the generated documents and the
instructions for students.
