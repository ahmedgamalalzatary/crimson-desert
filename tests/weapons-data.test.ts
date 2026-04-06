import { describe, expect, it } from "vitest";

import {
  createWeaponListItems,
  getWeaponFilterCounts,
  getWeaponDirectoryStateFromSearchParams,
  toWeaponDirectorySearchParams,
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
    character: null,
    sockets: "N/A" as const,
    stats: {
      baseDamage: 14,
      finalDamage: 18
    },
    craftingMaterials: [{ name: "Iron Ore", quantity: 4 }],
    refinement: [],
    description: "An axe featuring an imposing black blade.",
    source: {
      site: "crimsondesert.gg" as const,
      url: "https://crimsondesert.gg/database/weapons/one-hand-axe/black-iron-axe"
    }
  },
  {
    id: "ivory-bow",
    name: "Ivory Bow",
    slug: "ivory-bow",
    category: "weapons" as const,
    type: "bow",
    typeLabel: "Bow",
    rarity: "common",
    character: null,
    sockets: "N/A" as const,
    stats: {
      baseDamage: 9,
      finalDamage: 12
    },
    craftingMaterials: [{ name: "Ash Wood", quantity: 3 }],
    refinement: [],
    description: "A light bow with a stable draw.",
    source: {
      site: "crimsondesert.gg" as const,
      url: "https://crimsondesert.gg/database/weapons/bow/ivory-bow"
    }
  },
  {
    id: "storm-bow",
    name: "Storm Bow",
    slug: "storm-bow",
    category: "weapons" as const,
    type: "bow",
    typeLabel: "Bow",
    rarity: "rare",
    character: null,
    sockets: "N/A" as const,
    stats: {
      baseDamage: 17,
      finalDamage: 22
    },
    craftingMaterials: [{ name: "Storm Fragment", quantity: 2 }],
    refinement: [],
    description: "A bow that crackles with static energy.",
    source: {
      site: "crimsondesert.gg" as const,
      url: "https://crimsondesert.gg/database/weapons/bow/storm-bow"
    }
  }
];

describe("weapon data helpers", () => {
  it("creates summary list items without full description and materials payloads", () => {
    expect(createWeaponListItems(weapons)[0]).toEqual({
      id: "black-iron-axe",
      name: "Black Iron Axe",
      slug: "black-iron-axe",
      category: "weapons",
      type: "one-hand-axe",
      typeLabel: "One-Hand Axe",
      rarity: "rare",
      character: null,
      stats: {
        baseDamage: 14,
        finalDamage: 18
      },
      hasCrafting: true,
      hasSockets: false
    });
  });

  it("finds full weapon records by slug for detail pages", () => {
    expect(getWeaponBySlug(weapons, "black-iron-axe")).toEqual(weapons[0]);
    expect(getWeaponBySlug(weapons, "missing-weapon")).toBeUndefined();
  });

  it("builds static params for weapon detail routes", () => {
    expect(getStaticWeaponPaths(weapons)).toEqual([
      { params: { name: "black-iron-axe" } },
      { params: { name: "ivory-bow" } },
      { params: { name: "storm-bow" } }
    ]);
  });

  it("counts matching results per filter option using the active query and opposite filter group", () => {
    expect(
      getWeaponFilterCounts(weapons, {
        query: "bow",
        selectedRarities: ["common", "rare"],
        selectedTypes: ["bow"],
        selectedCharacters: [],
        hasCrafting: null,
        hasSockets: null,
        minDamage: null,
        maxDamage: null
      })
    ).toEqual({
      total: 2,
      rarityCounts: {
        common: 1,
        rare: 1
      },
      typeCounts: {
        bow: 2
      },
      characterCounts: {
        "": 2
      }
    });
  });

  it("serializes only active directory state into URL search params", () => {
    expect(
      toWeaponDirectorySearchParams({
        query: "bow",
        selectedRarities: ["common", "rare"],
        selectedTypes: ["bow"],
        selectedCharacters: [],
        hasCrafting: null,
        hasSockets: null,
        minDamage: null,
        maxDamage: null,
        sort: "finalDamage-desc"
      })
    ).toBe("q=bow&rarity=common%2Crare&type=bow&sort=finalDamage-desc");
  });

  it("reads directory state from URL search params with sane defaults", () => {
    expect(
      getWeaponDirectoryStateFromSearchParams(
        new URLSearchParams("q=axe&rarity=epic,rare&type=bow,one-hand-axe&sort=name-desc")
      )
    ).toEqual({
      query: "axe",
      selectedRarities: ["epic", "rare"],
      selectedTypes: ["bow", "one-hand-axe"],
      selectedCharacters: [],
      hasCrafting: null,
      hasSockets: null,
      minDamage: null,
      maxDamage: null,
      sort: "name-desc"
    });

    expect(getWeaponDirectoryStateFromSearchParams(new URLSearchParams(""))).toEqual({
      query: "",
      selectedRarities: [],
      selectedTypes: [],
      selectedCharacters: [],
      hasCrafting: null,
      hasSockets: null,
      minDamage: null,
      maxDamage: null,
      sort: "name-asc"
    });
  });
});
