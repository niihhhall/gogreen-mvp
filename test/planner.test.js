import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseKey } from "../src/calendar.js";
import { buildPlan } from "../src/planner.js";

const from = parseKey("2025-01-01");
const to = parseKey("2025-03-31");
const today = parseKey("2025-12-31");

const base = { from, to, today, seed: "test-seed", profile: "premium" };

describe("buildPlan", () => {
  it("produces one entry per day in the range", () => {
    const plan = buildPlan(base);
    assert.equal(plan.days.length, 90);
  });

  it("is reproducible for the same seed", () => {
    const first = buildPlan(base);
    const second = buildPlan(base);

    assert.deepEqual(
      first.days.map((day) => day.count),
      second.days.map((day) => day.count),
    );
  });

  it("changes shape when the seed changes", () => {
    const first = buildPlan(base);
    const second = buildPlan({ ...base, seed: "another-seed" });

    assert.notDeepEqual(
      first.days.map((day) => day.count),
      second.days.map((day) => day.count),
    );
  });

  it("counts exactly one commit entry per planned commit", () => {
    const plan = buildPlan(base);
    const planned = plan.days.reduce((total, day) => total + day.count, 0);

    assert.equal(plan.commits.length, planned);
    assert.equal(plan.summary.commits, planned);
  });

  it("skips days after today", () => {
    const plan = buildPlan({ ...base, to: parseKey("2025-06-30"), today: parseKey("2025-03-15") });
    const future = plan.days.filter((day) => day.state === "future");

    assert.equal(future.length, 107);
    assert.ok(future.every((day) => day.count === 0));
  });

  it("never dates a commit after today", () => {
    const reference = parseKey("2025-02-14");
    const plan = buildPlan({ ...base, today: reference });

    for (const commit of plan.commits) {
      const day = commit.timestamp.toISOString().slice(0, 10);
      assert.ok(day <= "2025-02-14", `${commit.key} is in the future`);
    }
  });

  it("tops up below-target days when skipExisting is set", () => {
    const plan = buildPlan(base);
    const history = new Map(plan.days.filter((day) => day.count > 0).map((day) => [day.key, day.count]));
    const topped = buildPlan({ ...base, history, skipExisting: true });

    assert.equal(topped.commits.length, 0);
  });

  it("respects maxPerDay", () => {
    const plan = buildPlan({ ...base, maxPerDay: 3 });
    assert.ok(plan.days.every((day) => day.count <= 3));
  });

  it("applies fixed weekday and weekend overrides", () => {
    const plan = buildPlan({ ...base, weekday: 2, weekend: 5, profile: "dense" });

    for (const day of plan.days) {
      const expected = day.weekend ? 5 : 2;
      assert.equal(day.count, expected, `${day.key} (weekend: ${day.weekend})`);
    }
  });

  it("gives weekend days heavier coverage than weekdays by default", () => {
    const plan = buildPlan({ ...base, seed: "weekend-check" });

    const average = (weekend) => {
      const days = plan.days.filter((day) => day.weekend === weekend);
      return days.reduce((total, day) => total + day.count, 0) / days.length;
    };

    assert.ok(average(true) > average(false));
  });

  it("rejects an unknown profile", () => {
    assert.throws(() => buildPlan({ ...base, profile: "loud" }), /unknown profile/);
  });
});
