import { describe, expect, it } from "vitest";

const categoryFiles = [
  "weapons",
  "armors",
  "shields",
  "abyss-gear",
  "bosses",
  "mounts",
  "quests"
];

describe("project structure", () => {
  it("tracks the planned category routes", () => {
    expect(categoryFiles).toHaveLength(8);
    expect(categoryFiles).toContain("weapons");
    expect(categoryFiles).toContain("quests");
  });
});
