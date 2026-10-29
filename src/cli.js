/**
 * Command orchestration.
 *
 * The flow is deliberately one direction: parse → validate → plan → preview →
 * (optionally) execute → (optionally) publish. A plan is always printed before
 * anything is written, and writing only happens behind an explicit flag.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { parseArgs, USAGE } from "./args.js";
import { human, parseKey, today, toKey } from "./calendar.js";
import {
  assertCleanIndex,
  assertRepository,
  commitEmpty,
  push,
  readHistory,
} from "./git.js";
import { buildPlan, PROFILES } from "./planner.js";
import { clearProgress, heatmap, legend, progress, summarise } from "./render.js";

const MAX_RANGE_DAYS = 3_660;

export async function main(argv) {
  const options = parseArgs(argv);

  if (options.help) {
    process.stdout.write(USAGE);
    return 0;
  }

  if (options.version) {
    console.log(`gg ${await readVersion()}`);
    return 0;
  }

  const cwd = process.cwd();
  const to = options.to ? parseKey(options.to, "--to") : today();
  const from = options.from
    ? parseKey(options.from, "--from")
    : parseKey(`${to.getUTCFullYear()}-01-01`, "start of year");

  if (from > to) {
    throw new Error(
      `--from (${toKey(from)}) is later than --to (${toKey(to)})`,
    );
  }

  const span = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;

  if (span > MAX_RANGE_DAYS) {
    throw new Error(
      `range covers ${span} days, the limit is ${MAX_RANGE_DAYS}. Narrow it with --from / --to.`,
    );
  }

  if (options.apply) {
    await assertRepository(cwd);
    await assertCleanIndex(cwd);
  }

  const history = await readHistory(cwd).catch(() => new Map());

  const plan = buildPlan({
    from,
    to,
    profile: options.profile,
    seed: options.seed,
    today: today(),
    history,
    skipExisting: options.skipExisting,
    maxPerDay: options.maxPerDay,
    weekday: options.weekday,
    weekend: options.weekend,
  });

  print(`\n${PROFILES[plan.profile].summary}\n`);
  print(heatmap(plan.days, { from, to, color: options.color }));
  print(legend(options.color));
  print("");
  print(summarise(plan));
  print("");

  if (plan.commits.length === 0) {
    print("Nothing to do: this range already meets the target.");
    return 0;
  }

  if (!options.apply) {
    print("Preview only. No commits were created.");
    print(`Run again with --apply to write ${plan.commits.length} commits.\n`);
    return 0;
  }

  const created = await execute(plan.commits, cwd);

  print(`\n✔ created ${created} commit${created === 1 ? "" : "s"}`);

  if (options.push) {
    print("↑ pushing…");

    try {
      await push(cwd);
      print("✔ pushed");
    } catch (error) {
      print("✖ push failed. The commits are safe locally.");
      print(`  ${error.message.split("\n")[0]}`);
      print("  Retry with: git push");
      return 1;
    }
  } else {
    print("→ not pushed. Run `git push` when you are ready.");
  }

  print("");
  return 0;
}

async function execute(commits, cwd) {
  let created = 0;

  for (const commit of commits) {
    const label = `${commit.key} · ${commit.index + 1}/${countFor(commits, commit.key)}`;

    try {
      await commitEmpty({
        timestamp: commit.timestamp,
        message: `chore(graph): ${label}`,
        cwd,
      });
    } catch (error) {
      clearProgress();
      throw new Error(
        `commit ${created + 1} of ${commits.length} failed on ${commit.key}\n` +
          `${error.message}\n` +
          `${created} commit${created === 1 ? "" : "s"} were created and kept.`,
      );
    }

    created += 1;
    progress(created, commits.length);
  }

  clearProgress();
  return created;
}

function countFor(commits, key) {
  return commits.reduce((total, commit) => total + (commit.key === key ? 1 : 0), 0);
}

async function readVersion() {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = await readFile(join(here, "..", "package.json"), "utf8");
  return JSON.parse(raw).version;
}

function print(line) {
  console.log(line);
}

export { human };
