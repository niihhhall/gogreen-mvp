/**
 * Calendar helpers.
 *
 * Every date in this tool is an all-day value anchored to UTC midnight. That
 * keeps the output stable no matter which timezone the machine runs in, which
 * matters because GitHub reads the date portion of the author timestamp.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

const pad = (value) => String(value).padStart(2, "0");

/** Format a Date as `YYYY-MM-DD`. */
export function toKey(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Parse `YYYY-MM-DD` into a UTC-anchored Date, rejecting impossible dates. */
export function parseKey(value, label = "date") {
  const match = ISO_DATE.exec(String(value ?? "").trim());

  if (!match) {
    throw new Error(`${label} must look like YYYY-MM-DD (received "${value}")`);
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  const roundTrips =
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day);

  if (!roundTrips) {
    throw new Error(`${label} is not a real calendar date (received "${value}")`);
  }

  return date;
}

/** Midnight UTC for today. */
export function today() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** Shift a date by whole days. */
export function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Whole-day distance between two dates. */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

/** 0 = Sunday … 6 = Saturday. */
export function dayOfWeek(date) {
  return date.getUTCDay();
}

export function isWeekend(date) {
  const day = dayOfWeek(date);
  return day === 0 || day === 6;
}

/** The Sunday on or before `date`. */
export function startOfWeek(date) {
  return addDays(date, -dayOfWeek(date));
}

/** Inclusive list of every day from `from` to `to`. */
export function eachDay(from, to) {
  const span = daysBetween(from, to);
  const days = [];

  for (let offset = 0; offset <= span; offset += 1) {
    days.push(addDays(from, offset));
  }

  return days;
}

/** Human-readable label, e.g. `Sat 1 Mar 2025`. */
export function human(date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
