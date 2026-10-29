import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addDays,
  daysBetween,
  eachDay,
  isWeekend,
  parseKey,
  startOfWeek,
  toKey,
} from "../src/calendar.js";

describe("parseKey", () => {
  it("accepts a real date", () => {
    assert.equal(toKey(parseKey("2025-03-01")), "2025-03-01");
  });

  it("accepts 29 February in a leap year", () => {
    assert.equal(toKey(parseKey("2024-02-29")), "2024-02-29");
  });

  it("rejects 29 February in a common year", () => {
    assert.throws(() => parseKey("2025-02-29"), /not a real calendar date/);
  });

  it("rejects an impossible day", () => {
    assert.throws(() => parseKey("2025-04-31"), /not a real calendar date/);
  });

  it("rejects the wrong shape", () => {
    assert.throws(() => parseKey("01/03/2025"), /must look like YYYY-MM-DD/);
    assert.throws(() => parseKey(""), /must look like YYYY-MM-DD/);
    assert.throws(() => parseKey(undefined), /must look like YYYY-MM-DD/);
  });
});

describe("date arithmetic", () => {
  it("adds and measures whole days", () => {
    const start = parseKey("2025-01-01");
    const later = addDays(start, 31);

    assert.equal(toKey(later), "2025-02-01");
    assert.equal(daysBetween(start, later), 31);
  });

  it("counts an inclusive range", () => {
    const days = eachDay(parseKey("2025-01-01"), parseKey("2025-01-31"));

    assert.equal(days.length, 31);
    assert.equal(toKey(days.at(-1)), "2025-01-31");
  });

  it("covers a leap-year February", () => {
    const days = eachDay(parseKey("2024-02-01"), parseKey("2024-02-29"));
    assert.equal(days.length, 29);
  });

  it("finds the Sunday that starts a week", () => {
    // 1 March 2025 is a Saturday.
    assert.equal(toKey(startOfWeek(parseKey("2025-03-01"))), "2025-02-23");
  });
});

describe("isWeekend", () => {
  it("treats Saturday and Sunday as weekend", () => {
    assert.equal(isWeekend(parseKey("2025-03-01")), true);
    assert.equal(isWeekend(parseKey("2025-03-02")), true);
  });

  it("treats weekdays as weekdays", () => {
    assert.equal(isWeekend(parseKey("2025-03-03")), false);
    assert.equal(isWeekend(parseKey("2025-03-07")), false);
  });
});
