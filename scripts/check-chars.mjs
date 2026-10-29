#!/usr/bin/env node

/**
 * Reject en and em dashes in every tracked text file.
 *
 * The characters are written as escapes below on purpose: this file is scanned
 * by itself, so it must not contain the literal characters it forbids.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BINARY = /\.(webp|png|jpe?g|gif|ico|pdf|zip|woff2?|ttf)$/i;

const RULES = [
  {
    character: "\u2013",
    name: "en dash",
    advice: "use a plain hyphen for ranges, as in Mon-Fri",
  },
  {
    character: "\u2014",
    name: "em dash",
    advice: "use a comma, colon, parentheses, or a full stop",
  },
];

function trackedFiles() {
  // Both tracked and untracked-but-not-ignored files, so a new file is checked
  // before its first commit rather than after.
  return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
}

function main() {
  const files = trackedFiles();
  const findings = [];

  for (const file of files) {
    if (BINARY.test(file)) continue;

    let text;

    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue; // Deleted in the working tree but still tracked.
    }

    const lines = text.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const rule of RULES) {
        let column = line.indexOf(rule.character);

        while (column !== -1) {
          findings.push({
            file,
            line: index + 1,
            column: column + 1,
            name: rule.name,
            advice: rule.advice,
          });

          column = line.indexOf(rule.character, column + 1);
        }
      }
    });
  }

  if (findings.length === 0) {
    console.log(`ok: no en or em dashes across ${files.length} tracked files`);
    return 0;
  }

  for (const finding of findings) {
    console.error(
      `${finding.file}:${finding.line}:${finding.column}  ${finding.name}, ${finding.advice}`,
    );
  }

  console.error(`\n${findings.length} forbidden dash character(s) found.`);
  console.error("See AGENTS.md. Run this again after fixing.");

  return 1;
}

process.exitCode = main();
