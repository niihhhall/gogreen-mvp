# Agent instructions

Conventions for anyone (human or AI) editing this repository.

## Hard rules

### Never use en or em dashes

Do not use the en dash (U+2013) or the em dash (U+2014) **anywhere** in this
project. That includes README prose, code comments, JSDoc, user-facing strings,
error messages, commit messages, changelogs, and any reply written about this
repository.

Use one of these instead:

| Instead of a dash | Use |
| --- | --- |
| Joining two clauses | A comma, a semicolon, or a full stop |
| Introducing an aside | Parentheses, or a colon |
| A numeric or date range | A plain hyphen, as in `Mon-Fri` or `2020-2025` |
| A list of details | A colon |

Enforced by `npm run lint`, which scans every tracked text file and exits
non-zero on the first offending character. `npm test` runs it too, so a run of
the test suite cannot pass with a dash in the tree.

The only exception is a binary file, which is skipped.

## Project conventions

- **Zero runtime dependencies.** Do not add packages to `dependencies`. If a job
  needs doing, write it from scratch with the Node standard library.
- **ES modules only.** `"type": "module"`, top-level `await`, explicit `.js`
  extensions in relative imports.
- **Node 18.17 or newer.** No APIs introduced after that.
- **Pure core, thin edges.** `src/planner.js` and `src/calendar.js` must not
  touch git, the filesystem, or the clock. All side effects live in
  `src/git.js` and `src/cli.js`. This is what makes the core testable.
- **Tests use `node:test` and `node:assert/strict`.** No test framework.
- **Writes stay behind `--apply`.** Any new flag that changes state must be
  opt-in, and the default path must remain a preview.

## Before committing

```bash
npm run lint    # no en or em dashes, anywhere
npm test        # unit tests plus the lint gate
```

## House style

- Two-space indentation, double quotes, trailing commas in multiline literals,
  semicolons.
- Comments explain *why*, not *what the next line does*.
- Error messages are lowercase, specific, and tell the reader what to do next.
- Prefer small named functions over long callbacks.
