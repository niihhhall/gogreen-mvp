<div align="center">

# gogreen-mvp

**Design your GitHub contribution graph in the terminal, preview it, then build it.**

[![Node](https://img.shields.io/badge/node-%E2%89%A518.17-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)
[![Tests](https://img.shields.io/badge/tests-25%20passing-success)](test)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub stars](https://img.shields.io/github/stars/niihhhall/gogreen-mvp?style=social)](https://github.com/niihhhall/gogreen-mvp/stargazers)

![GitHub contribution graph showing a full year of sustained activity, with weekend density visibly heavier than weekdays](assets/contribution-graph.webp)

</div>

`gg` is a small command-line tool. You describe a shape for your contribution graph (a date range, a density profile, a seed). It prints an exact preview of the calendar before a single commit exists. When the preview looks right, you apply it.

No dependencies. No configuration files. One command.

---

## Table of contents

- [About the project](#about-the-project)
- [Features](#features)
- [Install and run](#install-and-run)
- [How to use it](#how-to-use-it)
  - [Commands](#commands)
  - [Density profiles](#density-profiles)
  - [Recipes](#recipes)
- [How it works](#how-it-works)
- [Tests](#tests)
- [Project layout](#project-layout)
- [FAQ](#faq)
- [A note on honest use](#a-note-on-honest-use)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

---

## About the project

### The problem

A GitHub profile is read in about four seconds. Before anyone opens a repository, clicks a pin, or reads a line of code, they see one thing: the contribution graph. It is the only part of a profile that shows volume, rhythm, and consistency at a glance.

Most "fill my graph" scripts get this wrong. They paint every day the same colour, rewrite a marker file thousands of times, set only one of the two commit dates, and give you no way to see the result before it is pushed.

### What it does

`gg` turns the graph into something you design on purpose:

1. You pick a date range and a shape.
2. It prints a shaded calendar in the terminal, plus exact counts: commits, active days, rest days, and the busiest single day.
3. Nothing is written until you add `--apply`. The same `--seed` always gives the same graph, so the preview you approved is the graph you get.

### Why the shape matters more than the number

A graph that is uniformly dark reads as noise. A graph that is uniformly empty reads as absence. What looks credible is **contrast**: dense weekends, quieter weekdays, a handful of empty days, and no single day that spikes far above the rest. Every profile in `gg` is a distribution built around that idea, not a flat count.

### Why these technical choices

- **Plain Node.js, zero dependencies.** The tool only needs to plan dates and call `git`. The standard library does both, so there is nothing to install and nothing to audit.
- **A pure planner.** The code that decides the plan never touches git, the disk, or the clock. That makes the preview exact and the planning layer fast to test.
- **A seeded random generator.** `Math.random()` cannot be replayed. A seed can, which is what makes "preview, then apply the same thing" possible.

### Challenges solved along the way

- **Preview and apply must match exactly.** Solved with the seeded generator and a planner that has no side effects.
- **Backdated commits must look the same everywhere.** Git stores an author date and a committer date. Setting only one makes the commit show different dates in different views, so `gg` sets both.
- **Your own work must never be swept in.** The run stops if you have staged changes, and every commit is empty.
- **Explicit counts must not be silently clipped.** When you ask for `--weekday 52-78`, the default daily ceiling grows to fit your range instead of cutting it.

---

## Features

- Exact terminal preview of the calendar before anything is written.
- Four density profiles, from `subtle` to `dense`, each with deliberate rest days.
- Fixed counts or ranges for weekdays and weekends (`--weekday 2`, `--weekend 4-9`).
- Reproducible plans: the same seed and range always give the same graph.
- `--skip-existing` reads your real history and only tops up days below target.
- Empty commits only, so your files are never touched.
- Both author and committer dates are backdated.
- Safe by default: preview only, future days skipped, staged changes block the run, ranges capped at ten years.
- Optional push when the run finishes, with a clear retry message if the push fails.
- Zero runtime dependencies. Works anywhere Node 18.17+ and git run.

---

## Install and run

### Requirements

- [Node.js](https://nodejs.org) 18.17 or newer
- [git](https://git-scm.com)

There is no `npm install` step, because there are no dependencies.

### Steps

```bash
# 1. Get the code.
git clone https://github.com/niihhhall/gogreen-mvp.git
cd gogreen-mvp

# 2. Preview the current year. Nothing is written.
node bin/gg.js

# 3. Preview a specific range with a reproducible shape.
node bin/gg.js --from 2025-01-01 --to 2025-12-31 --profile premium --seed spring

# 4. Apply it, and publish.
node bin/gg.js --from 2025-01-01 --to 2025-12-31 --seed spring --apply --push
```

To run `gg` from any repository, install it globally:

```bash
npm link
gg --profile balanced
```

> **Tip:** run `gg` inside a repository you own and that is linked to your GitHub account. Commits only count on your graph when the commit email matches an email on your GitHub account.

---

## How to use it

### Commands

| Flag | What it does |
| --- | --- |
| `--from <YYYY-MM-DD>` | First day to cover. Defaults to 1 January of the target year. |
| `--to <YYYY-MM-DD>` | Last day to cover. Defaults to today. |
| `--profile <name>` | `subtle`, `balanced`, `premium`, or `dense`. Default `premium`. |
| `--weekday <n\|a-b>` | Commits on Mon-Fri, as a count (`2`) or a range (`52-78`). Overrides the profile and disables rest days. |
| `--weekend <n\|a-b>` | Commits on Sat-Sun, as a count or a range. Same behaviour. |
| `--max-per-day <n>` | Hard ceiling on any single day. Default 18, raised automatically to fit an explicit range. |
| `--seed <text>` | Any string. The same seed always produces the same graph. Default `default`. |
| `--skip-existing` | Top up days that are below target instead of adding on top. |
| `--apply` | Actually create the commits. Without this, the run is a preview. |
| `--push` | Push when the run finishes. Requires `--apply`. |
| `--no-color` | Plain output. The `NO_COLOR` environment variable also works. |
| `--help`, `-h` | Show the full reference. |
| `--version`, `-v` | Print the version. |

### Density profiles

| Profile | Character | Approx. commits / year |
| --- | --- | --- |
| `subtle` | Low-key presence. Mostly open calendar with a scattering of marks. | ~250 |
| `balanced` | Steady weekday rhythm, weekends visibly stronger. | ~750 |
| `premium` | Deep, consistent coverage with texture. **Default.** | ~1,100 |
| `dense` | Maximum saturation. No contrast left, so use sparingly. | ~2,300 |

Each profile leaves a share of days deliberately empty. Those gaps are what make the busy days look deliberate instead of automated.

### Recipes

**Make a full year look like sustained, deliberate work**

```bash
node bin/gg.js --from 2025-01-01 --to 2025-12-31 --profile premium --seed spring --apply --push
```

**Fill in only the gaps in the current year**

```bash
node bin/gg.js --profile balanced --skip-existing --apply --push
```

`--skip-existing` reads your real history first, counts the commits already on each date, and only creates what is missing. Run it monthly and the graph stays even without over-saturating a day.

**Try a few shapes before choosing one**

```bash
node bin/gg.js --from 2025-01-01 --to 2025-12-31 --seed a
node bin/gg.js --from 2025-01-01 --to 2025-12-31 --seed b
node bin/gg.js --from 2025-01-01 --to 2025-12-31 --seed c --profile balanced
```

Nothing is written until you add `--apply`, so this is free.

**Draw something deliberately even**

```bash
node bin/gg.js --from 2025-01-01 --to 2025-12-31 --weekday 2 --weekend 2 --apply
```

Fixed counts remove all randomness: every day gets exactly the number you name. Useful for bands, blocks, and patterns.

---

## How it works

Four decisions shape the whole tool.

**Empty commits, not file churn.** Every commit is created with `git commit --allow-empty`. No marker file is rewritten over and over, so your history contains nothing but the commits themselves. Nothing to clean up later.

**Both dates are backdated.** `gg` sets `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` to the same moment, so the commit is consistent everywhere it is read.

**Deterministic by seed.** The same seed and range produce a byte-identical plan. A preview can be reviewed, adjusted, and then applied with confidence that it is the same graph.

**History-aware.** Before planning, the tool reads the commit count for every date already in the repository, not just the ones it created. That is what makes `--skip-existing` accurate and lets you mix real work with deliberate coverage without double-counting.

### Safety rails

- The default is **preview only**. Writing requires `--apply`.
- Commits dated after today are skipped automatically.
- The run stops if you have staged changes, so nothing of yours ends up in an empty commit.
- A push failure leaves the commits intact locally and tells you how to retry.
- Ranges are capped at ten years.

---

## Tests

The tests use Node's built-in test runner, so there is nothing to install.

```bash
npm test      # unit tests, then the repository checks
npm run lint  # repository checks only (no en or em dashes in any file)
```

The planner and calendar logic are covered by unit tests in [`test/`](test).

---

## Project layout

```
bin/gg.js          executable entry point
src/args.js        argument parsing and usage text
src/calendar.js    date parsing, ranges, weekend detection
src/planner.js     density profiles and plan construction
src/random.js      seeded random number generator
src/git.js         commit, history, and push wrappers
src/render.js      heatmap preview and progress bar
src/cli.js         command flow: parse, plan, preview, apply, push
scripts/           repository checks (see AGENTS.md)
test/              unit tests (node:test, no dependencies)
AGENTS.md          editing conventions and hard rules
```

The planner is pure: given a range, a profile, and a seed, it returns a plan and touches nothing. Everything that writes to disk or runs git lives in `src/git.js` and `src/cli.js`.

---

## FAQ

**Does this rewrite existing history?**
No. Every commit is new and appended to the current branch. Nothing is amended, rebased, or force-pushed.

**Will it look different on my profile than in the preview?**
The preview maps commit counts to five shade levels using the same thresholds GitHub uses. The shape will match.

**Can I undo a run?**
Yes, before you push. Every commit is empty, so `git reset --hard <ref>` removes them cleanly with no file changes to reconcile.

**Does it work on a private repository?**
Private contributions only appear on the graph if you turn on *Settings → Profile → Contribution settings → Include private contributions on my profile*.

**What if I already have real commits in the range?**
They are counted. With `--skip-existing` they are respected; without it, they stack on top. Prefer `--skip-existing` when mixing real work with design.

**Why are my commits not showing on the graph?**
Check that the commit email in your git config is an email on your GitHub account, and that the commits are on the default branch of the repository.

---

## A note on honest use

The graph shows activity, not skill. Anyone who opens the repository will see empty commits named `chore(graph): ...`. Use `gg` on repositories you own, and do not use it to mislead an employer or a client about work you did.

---

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up, the house rules, and how to open a pull request. Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).

- Found a bug? [Open a bug report](https://github.com/niihhhall/gogreen-mvp/issues/new/choose).
- Found a security problem? Do not open a public issue. Follow [SECURITY.md](SECURITY.md).
- Changes between versions are listed in [CHANGELOG.md](CHANGELOG.md).

---

## Credits

- Built by [Nihal Mishra](https://github.com/niihhhall).
- Badges by [shields.io](https://shields.io).
- README structure based on [How to Write a Good README File for Your GitHub Project](https://www.freecodecamp.org/news/how-to-write-a-good-readme-file/) by Hillary Nyakundi on freeCodeCamp.

---

## License

Released under the [MIT License](LICENSE). © 2026 Nihal Mishra.
