# Contributing

This file is for whoever changes the code, the content or the pipelines: the
teacher, and anyone helping with the site. Students submit lab reports and do
not need any of this — their instructions are in [reports/README.md](reports/README.md).

Setup, commands and the layout of the repository are in [README.md](README.md).
This file only says how a change travels: branch, commits, pull request, merge.

## Branches

| Branch                                                       | Who     | What                                                                              |
|--------------------------------------------------------------|---------|-----------------------------------------------------------------------------------|
| `main`                                                       | —       | the site and everything merged; deploys on push                                   |
| `lab/<course>/groups/<group>/labs/<NN>`                      | teacher | one lab of one group, opened with `npm run open:assignment`                       |
| `report/<course>/groups/<group>/labs/<NN>/students/<number>` | student | one student's report, branched off the lab branch                                 |
| `<type>/<slug>`                                              | teacher | any other change: `fix/pmzi-lecture-10`, `content/os-lab-11-cmd`, `ci/report-pdf` |

`<type>` is one of the commit types below; `<slug>` is a few lowercase words
joined with hyphens. Nothing is pushed straight to `main`: every change comes
through a pull request, and the branch is deleted once it is merged.

## Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body — why the change was needed, what it does not do, how it was checked>

Co-Authored-By: …
```

**Type** is one of these, and only these:

| Type       | Used for                                                               |
|------------|------------------------------------------------------------------------|
| `feat`     | a new capability of the site, the scripts or the pipelines             |
| `fix`      | a defect in any of them                                                |
| `refactor` | a code change with no visible effect                                   |
| `content`  | lectures, labs, self-study topics, quizzes — anything under `content/` |
| `reports`  | student reports and the documents built from them, under `reports/`    |
| `docs`     | README files, this file, instructions                                  |
| `ci`       | GitHub Actions workflows and the composite actions                     |
| `chore`    | everything else: dependencies, group lists, regenerated guides         |

`feature`, `Reports:`, `lab03:` and a subject with no type at all have all been
used here before; none of them is valid. The history keeps them, new commits
do not.

**Scope** is optional and names the part touched, in lowercase: a course
(`os`, `pmzi`), an area (`site`, `scripts`, `answers`, `guides`) or a group
(`pz-23-1-9`). Leave it out when the subject already says where the change is.

**Subject** is the change in the imperative mood — "add", "fix", "let", not
"added" or "fixes" — lowercase, no trailing period, and the whole first line
fits in 72 characters. It says what the commit does, not what the author did:

```
feat(scripts): build a PDF next to every report .docx
fix: stop the report build failing when it built nothing
content(pmzi): let the student pick the implementation language
reports(pz-23-1-9): pmzi lab 03, student 21
docs: make a branch name repeat the path it collects
ci: lint the title of a pull request into main
chore: rebuild the guides after the language change
```

**Body** is where the reasons go. The subject says what; the body says why it
was needed, what alternatives were rejected and what was checked. A one-line
commit is fine for a change whose reason is obvious from the diff — a typo, a
regenerated document — and wrong for anything that took a decision. Wrap the
body at 72 characters, and keep trailers such as `Co-Authored-By` on their own
lines at the end.

**Language** is English for every commit message, subject and body alike,
whatever the change touches. Content and instructions are Ukrainian; the
history that describes them is not.

Commits made by the pipeline follow the same rule
(`chore(reports): build .docx for #42 [skip ci]`).

## Pull requests

One pull request is one change, and its title is written as the first line of
a commit — because after a squash merge that is exactly what it becomes. A
pull request into `main` fails a check when its title does not follow the
format above; fix the title, not the check.

Before asking for a merge:

- `npm run lint` passes, and `npm run build` if the site changed;
- `npm run verify:examples` passes if a code example in the materials changed;
- `npm run generate:labs` was run if a lab changed, and the guides are in the diff;
- `npm run answers:check` is green: no `.answers` file, no secret key;
- the description says why, not just what — one paragraph is enough.

## Merging

Every branch is merged with **squash**, and the squash commit takes the title
and the description of the pull request. Set the title before merging: GitHub
otherwise fills it with the branch name, and `Lab/02 software security methods/…`
is how #19 got into the history.

| Pull request             | Squash commit                                           |
|--------------------------|---------------------------------------------------------|
| `report/…` → `lab/…`     | `reports(<group>): <course> lab <NN>, student <number>` |
| `lab/…` → `main`         | `reports(<group>): close <course> lab <NN>`             |
| `<type>/<slug>` → `main` | the title of the pull request                           |

`<course>` is `os` or `pmzi`: a group takes both subjects, and `lab 03` alone
does not say which one.

The merge of a report is the moment the pipeline builds its document: see the
teacher's section of [reports/README.md](reports/README.md).

## What must not be committed

- A quiz answer key in plaintext (`*.answers`) — only the `.age` ciphertext.
  `npm run answers:check` runs on every push and fails on a plaintext key.
- The age secret key, anywhere.
- `data/` — the curricula and the samples are not part of the public repository.
- A student's screenshot with anything but the program window in it.

## Language

Code, comments, commit messages and tooling output are in English. Ukrainian
is for the content: the materials, the site interface, the generated documents
and the instructions for students.
