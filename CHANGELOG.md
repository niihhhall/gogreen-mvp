# Changelog

All notable changes to this project are listed here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `--weekday` and `--weekend` accept a range such as `52-78` as well as a single count.
- The default daily ceiling grows to fit an explicit range, so a requested range is never clipped.
- `npm run lint` rejects en and em dashes in every tracked text file, and `npm test` runs it too.
- Contributor files: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and this changelog.

### Changed

- README rewritten with a table of contents, features list, install steps, tests, contributing, and credits sections.

## [2.0.0] - 2026-10-29

### Added

- Zero-dependency command-line tool, `gg`, with a shaded terminal preview of the calendar.
- Density profiles: `subtle`, `balanced`, `premium` (default), and `dense`.
- Seeded random generator, so the same seed and range always give the same plan.
- `--skip-existing` to top up only days that are below target.
- `--apply` and `--push` flags. The default run is a preview and writes nothing.
- Safety checks: future days are skipped, staged changes stop the run, ranges are capped at ten years.
- Unit tests with `node:test`.

### Changed

- Replaces the original script, which rewrote a data file for every commit. Commits are now empty, and both the author date and the committer date are backdated.

[Unreleased]: https://github.com/niihhhall/gogreen-mvp/compare/8765189...HEAD
[2.0.0]: https://github.com/niihhhall/gogreen-mvp/commit/8765189
