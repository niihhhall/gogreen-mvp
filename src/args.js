/**
 * Argument parsing.
 *
 * Hand-rolled to keep the dependency list at zero and the error messages
 * specific to this tool.
 */

import { PROFILES, DEFAULT_PROFILE } from "./planner.js";

export const USAGE = `
  gg — build a contribution graph you actually designed

  Usage
    gg [options]

  Range
    --from <YYYY-MM-DD>     first day to cover            (default: 1 Jan this year)
    --to   <YYYY-MM-DD>     last day to cover             (default: today)

  Shape
    --profile <name>        ${Object.keys(PROFILES).join(" | ")}
                                                          (default: ${DEFAULT_PROFILE})
    --weekday <n>           fixed commits on Mon–Fri, overrides the profile
    --weekend <n>           fixed commits on Sat–Sun, overrides the profile
    --max-per-day <n>       hard ceiling per day          (default: 18)
    --seed <text>           same seed, same graph         (default: "default")
    --skip-existing         top up only days that are below target

  Safety
    --apply                 actually create the commits   (default: preview only)
    --push                  push when the run finishes
    --no-color              plain output

  Other
    --help, -h              show this text
    --version, -v           print the version

  Examples
    gg
        Preview the current year at the default profile.

    gg --from 2025-01-01 --to 2025-12-31 --profile premium --seed spring
        Preview a full year with a reproducible shape.

    gg --profile balanced --skip-existing --apply --push
        Top up the current year and publish it.
`;

/** Parse argv (without the leading node/script entries). */
export function parseArgs(argv) {
  const options = {
    from: undefined,
    to: undefined,
    profile: DEFAULT_PROFILE,
    weekday: undefined,
    weekend: undefined,
    maxPerDay: 18,
    seed: "default",
    skipExisting: false,
    apply: false,
    push: false,
    color: !process.env.NO_COLOR && process.env.TERM !== "dumb",
    help: false,
    version: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    const needsValue = () => {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`${token} needs a value`);
      }
      index += 1;
      return value;
    };

    const asInteger = () => {
      const raw = needsValue();
      const value = Number(raw);
      if (!Number.isInteger(value) || value < 0) {
        throw new Error(`${token} needs a whole number of 0 or more (received "${raw}")`);
      }
      return value;
    };

    switch (token) {
      case "--from":
        options.from = needsValue();
        break;
      case "--to":
        options.to = needsValue();
        break;
      case "--profile": {
        const value = needsValue();
        if (!PROFILES[value]) {
          throw new Error(
            `unknown profile "${value}" — choose one of: ${Object.keys(PROFILES).join(", ")}`,
          );
        }
        options.profile = value;
        break;
      }
      case "--weekday":
        options.weekday = asInteger();
        break;
      case "--weekend":
        options.weekend = asInteger();
        break;
      case "--max-per-day":
        options.maxPerDay = asInteger();
        break;
      case "--seed":
        options.seed = needsValue();
        break;
      case "--skip-existing":
        options.skipExisting = true;
        break;
      case "--apply":
        options.apply = true;
        break;
      case "--push":
        options.push = true;
        break;
      case "--no-color":
        options.color = false;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--version":
      case "-v":
        options.version = true;
        break;
      default:
        throw new Error(`unknown option "${token}"\nRun with --help for the full list.`);
    }
  }

  if (options.push && !options.apply) {
    throw new Error("--push only makes sense together with --apply");
  }

  return options;
}
