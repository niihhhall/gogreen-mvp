# Security policy

## Supported versions

Only the latest release on the `master` branch receives fixes.

| Version | Supported |
| --- | --- |
| 2.x | Yes |
| 1.x and earlier | No |

## What counts as a security problem

`gg` runs `git` on your machine and creates commits. Examples of problems worth reporting privately:

- A way to make `gg` run a command other than `git`.
- A way to make `gg` write files, change files, or commit staged work when it should only create empty commits.
- A way to make `gg` write anything without `--apply`.

A wrong count in the preview, or a visual bug, is a normal bug. Report it with the bug report form.

## How to report

Do not open a public issue for a security problem.

Report it privately through GitHub: open the [Security tab](https://github.com/niihhhall/gogreen-mvp/security) of this repository and select **Report a vulnerability**.

Include:

- What the problem is and what an attacker could do with it.
- The steps or command to reproduce it.
- Your Node version, git version, and operating system.

## What happens next

- You get a first reply within 7 days.
- When the problem is confirmed, a fix is prepared and released as soon as possible.
- You are credited in the release notes, unless you ask not to be.
