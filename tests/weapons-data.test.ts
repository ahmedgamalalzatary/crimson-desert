import { describe, expect, it } from "vitest";

import {
  createWeaponListItems,
  getStaticWeaponPaths,
  getWeaponBySlug
} from "../src/lib/weapons";

const weapons = [
  {
    id: "black-iron-axe",
    name: "Black Iron Axe",
    slug: "black-iron-axe",
    category: "weapons" as const,
    type: "one-hand-axe",
    typeLabel: "One-Hand Axe",
    rarity: "rare",
    stats: {
      baseDamage: 14,
      finalDamage: 18
    },
    materials: [{ name: "Iron Ore", quantity: 4 }],
    description: "An axe featuring an imposing black blade.",
    source: {
      site: "crimsondesert.gg" as const,
      url: "https://crimsondesert.gg/database/weapons/one-hand-axe/black-iron-axe"
    }
  }
];

describe("weapon data helpers", () => {
  it("creates summary list items without full description and materials payloads", () => {
    expect(createWeaponListItems(weapons)).toEqual([
      {
        id: "black-iron-axe",
        name: "Black Iron Axe",
        slug: "black-iron-axe",
        category: "weapons",
        type: "one-hand-axe",
        typeLabel: "One-Hand Axe",
        rarity: "rare",
        stats: {
          baseDamage: 14,
          finalDamage: 18
        }
      }
    ]);
  });

  it("finds full weapon records by slug for detail pages", () => {
    expect(getWeaponBySlug(weapons, "black-iron-axe")).toEqual(weapons[0]);
    expect(getWeaponBySlug(weapons, "missing-weapon")).toBeUndefined();
  });

  it("builds static params for weapon detail routes", () => {
    expect(getStaticWeaponPaths(weapons)).toEqual([{ params: { name: "black-iron-axe" } }]);
  });
});
