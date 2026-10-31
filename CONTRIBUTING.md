# Contributing to gogreen-mvp

Thank you for taking the time to help. This guide explains how to report a problem, suggest an idea, and send a change.

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to help

- **Report a bug.** Use the [bug report form](https://github.com/niihhhall/gogreen-mvp/issues/new/choose). Include the exact command you ran and the output.
- **Suggest a feature.** Use the feature request form. Describe the problem first, then the change you have in mind.
- **Improve the docs.** Small fixes to the README or this guide are welcome as a pull request.
- **Send code.** Read the rules below first.

Security problems are different: do not open a public issue. Follow [SECURITY.md](SECURITY.md).

## Set up

You need [Node.js](https://nodejs.org) 18.17 or newer and [git](https://git-scm.com). There are no dependencies to install.

```bash
git clone https://github.com/<your-username>/gogreen-mvp.git
cd gogreen-mvp
npm test
```

To try the tool without touching a real repository, run it in a throwaway folder:

```bash
mkdir ../gg-sandbox
cd ../gg-sandbox
git init
node ../gogreen-mvp/bin/gg.js --from 2025-01-01 --to 2025-01-31 --apply
```

## House rules

The full list lives in [AGENTS.md](AGENTS.md). The short version:

- **No en or em dashes anywhere.** Not in code, comments, docs, or commit messages. `npm run lint` fails if it finds one.
- **Zero runtime dependencies.** Do not add packages to `dependencies`. Use the Node standard library.
- **ES modules only**, with explicit `.js` extensions in relative imports.
- **Node 18.17 or newer.** Do not use APIs added after that version.
- **Pure core, thin edges.** `src/planner.js` and `src/calendar.js` must not touch git, the filesystem, or the clock. Side effects live in `src/git.js` and `src/cli.js`.
- **Writes stay behind `--apply`.** Any new flag that changes state must be opt-in. The default run stays a preview.
- **Tests use `node:test` and `node:assert/strict`.** No test framework.
- **Style:** two-space indentation, double quotes, trailing commas in multiline literals, semicolons. Comments explain why, not what.
- **Error messages** are lowercase, specific, and tell the reader what to do next.

## Send a pull request

1. Fork the repository and create a branch from `master`, for example `fix/skip-existing-off-by-one`.
2. Make your change. Keep it small and focused on one thing.
3. Add or update tests for any change to planning or calendar logic.
4. Run the checks:

   ```bash
   npm run lint
   npm test
   ```

5. Update `README.md` if you changed a flag or a behaviour, and add a line under `[Unreleased]` in `CHANGELOG.md`.
6. Open the pull request and fill in the template.

### Commit messages

Write a short summary in the imperative, for example `Support count ranges in weekday overrides`. Add a body if the reason for the change is not obvious.

## Questions

Open an issue and add the `question` label. There is no question too small.
