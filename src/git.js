/**
 * Git plumbing.
 *
 * Thin, explicit wrappers over the `git` binary. Nothing here decides policy:
 * the caller passes a complete instruction and gets a result or a raised error.
 */

import { execFile } from "node:child_process";

const MAX_BUFFER = 64 * 1024 * 1024;

/** Run git and resolve its trimmed stdout. */
export function git(args, { cwd = process.cwd(), env = {} } = {}) {
  return new Promise((resolve, reject) => {
    execFile(
      "git",
      args,
      {
        cwd,
        maxBuffer: MAX_BUFFER,
        env: { ...process.env, ...env },
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error) {
          const detail = String(stderr || "").trim();
          error.message = detail ? `${error.message}\n${detail}` : error.message;
          return reject(error);
        }

        resolve(String(stdout));
      },
    );
  });
}

/** Fail early, with a readable message, if the working directory is not a repo. */
export async function assertRepository(cwd) {
  try {
    const root = await git(["rev-parse", "--show-toplevel"], { cwd });
    return root.trim();
  } catch {
    throw new Error(
      `not a git repository: ${cwd}\nRun this from inside a repository you own.`,
    );
  }
}

/** Refuse to run with staged changes, which would otherwise be swept into a commit. */
export async function assertCleanIndex(cwd) {
  try {
    await git(["diff", "--cached", "--quiet"], { cwd });
  } catch {
    throw new Error(
      "you have staged changes.\n" +
        "Commit or unstage them first. This tool only creates empty commits.",
    );
  }
}

/**
 * Count existing commits per calendar date, read from the author date.
 *
 * Using the whole history (not just commits this tool made) means a plan can
 * respect work that is already there, whatever produced it.
 */
export async function readHistory(cwd) {
  const raw = await git(["log", "--format=%ad", "--date=short"], { cwd });
  const counts = new Map();

  for (const line of raw.split("\n")) {
    const key = line.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

/** Create an empty commit dated to a specific moment. */
export async function commitEmpty({ timestamp, message, cwd }) {
  const stamp = timestamp.toISOString();

  await git(["commit", "--allow-empty", "--no-verify", "-m", message], {
    cwd,
    env: { GIT_AUTHOR_DATE: stamp, GIT_COMMITTER_DATE: stamp },
  });
}

/** Push the current branch to its upstream, setting it on first push. */
export async function push(cwd) {
  try {
    return await git(["push"], { cwd });
  } catch {
    return git(["push", "--set-upstream", "origin", "HEAD"], { cwd });
  }
}

/** Current branch name. */
export async function currentBranch(cwd) {
  return (await git(["rev-parse", "--abbrev-ref", "HEAD"], { cwd })).trim();
}
