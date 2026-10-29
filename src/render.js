/**
 * Terminal presentation: a heatmap preview so a plan can be inspected before
 * a single commit exists, plus small formatting helpers.
 */

import { WEEKDAY_NAMES, addDays, human, startOfWeek, toKey } from "./calendar.js";

const LEVELS = ["·", "░", "▒", "▓", "█"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Map a commit count onto one of five shade levels. */
export function shade(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/**
 * Render the plan as a contribution-style grid.
 *
 * @param {Array<{key: string, count: number}>} days
 * @param {{from: Date, to: Date, color?: boolean}} range
 */
export function heatmap(days, { from, to, color = false }) {
  const counts = new Map(days.map((day) => [day.key, day.count]));
  const firstColumn = startOfWeek(from);
  const span = Math.round((to.getTime() - firstColumn.getTime()) / 86_400_000);
  const columns = Math.floor(span / 7) + 1;

  const rows = WEEKDAY_NAMES.map((name) => `${name} `.padEnd(5));

  const labelRow = buildLabels(firstColumn, columns, from);

  for (let column = 0; column < columns; column += 1) {
    const columnStart = addDays(firstColumn, column * 7);

    for (let weekday = 0; weekday < 7; weekday += 1) {
      const date = addDays(columnStart, weekday);

      if (date < from || date > to) {
        rows[weekday] += "  ";
        continue;
      }

      const count = counts.get(toKey(date)) ?? 0;
      const glyph = LEVELS[shade(count)];
      rows[weekday] += `${paint(glyph, shade(count), color)} `;
    }
  }

  return [labelRow, ...rows].join("\n");
}

function buildLabels(firstColumn, columns, from) {
  const width = columns * 2;
  const buffer = Array.from({ length: width }, () => " ");
  let previousMonth = -1;

  for (let column = 0; column < columns; column += 1) {
    const columnStart = addDays(firstColumn, column * 7);
    // Label a column by its first *visible* day so a partial week at the
    // start of the range does not borrow the previous month's name.
    const visible = columnStart < from ? from : columnStart;
    const month = visible.getUTCMonth();

    if (month === previousMonth) continue;

    const label = MONTHS[month];
    const start = column * 2;

    for (let index = 0; index < label.length && start + index < width; index += 1) {
      buffer[start + index] = label[index];
    }

    previousMonth = month;
  }

  return `     ${buffer.join("")}`;
}

function paint(glyph, level, color) {
  if (!color || level === 0) return glyph;

  const palette = [undefined, "\u001b[32m", "\u001b[32m", "\u001b[32;1m", "\u001b[32;1m"];
  return `${palette[level]}${glyph}\u001b[0m`;
}

/** One-line summary of a plan. */
export function summarise(plan) {
  const { summary, profile, seed } = plan;

  return [
    `profile     ${profile}  (seed "${seed}")`,
    `range       ${human(plan.days[0].date)} → ${human(plan.days.at(-1).date)}`,
    `commits     ${summary.commits}`,
    `active days ${summary.activeDays} of ${summary.daysInRange}`,
    `rest days   ${summary.restDays}`,
    `peak        ${summary.peak} commits on a single day`,
    summary.futureDays ? `skipped     ${summary.futureDays} future days` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/** A simple carriage-return progress line. */
export function progress(done, total, label = "committing") {
  if (!process.stdout.isTTY) return;

  const width = 24;
  const filled = total === 0 ? width : Math.round((done / total) * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);

  process.stdout.write(`\r${label} ${bar} ${done}/${total}`);
}

export function clearProgress() {
  if (process.stdout.isTTY) process.stdout.write("\r\u001b[2K");
}

/** Shade legend for the heatmap. */
export function legend(color = false) {
  const shades = LEVELS.map((glyph, level) => paint(glyph, level, color)).join(" ");
  return `     less ${shades} more`;
}
