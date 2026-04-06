import { describe, expect, it } from "vitest";
import {
  categoryIds,
  createConflictField,
  entitySchema,
  sourceIds
} from "../scripts/lib/schema";

describe("schema constants", () => {
  it("defines the supported source ids", () => {
    expect(sourceIds).toEqual(["crimsondesert-gg", "crimsondesert-th-gl", "game8"]);
  });

  it("defines the supported category ids", () => {
    expect(categoryIds).toEqual([
      "weapons",
      "armors",
      "shields",
      "accessories",
      "abyss-gear",
      "bosses",
      "mounts",
      "quests-main",
      "quests-faction"
    ]);
  });
});

describe("entity schema", () => {
  it("accepts a valid normalized entity", () => {
    const parsed = entitySchema.parse({
      id: "ashen-blade",
      category: "weapons",
      name: "Ashen Blade",
      slug: "ashen-blade",
      sources: [
        {
          sourceId: "crimsondesert-gg",
          sourceUrl: "https://crimsondesert.gg/weapons/ashen-blade",
          fields: {
            rarity: "Epic"
          }
        }
      ]
    });

    expect(parsed.slug).toBe("ashen-blade");
    expect(parsed.sources[0]?.fields.rarity).toBe("Epic");
  });

  it("rejects an unknown category", () => {
    expect(() =>
      entitySchema.parse({
        id: "ashen-blade",
        category: "potions",
        name: "Ashen Blade",
        slug: "ashen-blade",
        sources: []
      })
    ).toThrow();
  });
});

describe("conflict field helper", () => {
  it("marks fields as conflicting when values differ", () => {
    const conflict = createConflictField("defense", [
      {
        sourceId: "crimsondesert-gg",
        value: 6
      },
      {
        sourceId: "crimsondesert-th-gl",
        value: 7
      }
    ]);

    expect(conflict.field).toBe("defense");
    expect(conflict.hasConflict).toBe(true);
  });

  it("does not mark fields as conflicting when values match", () => {
    const conflict = createConflictField("rarity", [
      {
        sourceId: "crimsondesert-gg",
        value: "Epic"
      },
      {
        sourceId: "game8",
        value: "Epic"
      }
    ]);

    expect(conflict.hasConflict).toBe(false);
  });
});
