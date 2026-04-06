import { describe, expect, it } from "vitest";

import { getOrderedRarityOptions, sortWeaponsByRarity } from "../src/lib/rarity";

describe("rarity ordering", () => {
  it("orders rarity filter options by the configured game tier order", () => {
    const result = getOrderedRarityOptions([
      "epic",
      "common",
      "rare",
      "uncommon",
      "legendary"
    ]);

    expect(result).toEqual(["common", "uncommon", "rare", "epic", "legendary"]);
  });

  it("sorts weapons by rarity rank instead of alphabetically", () => {
    const weapons = [
      { name: "B", rarity: "epic" },
      { name: "C", rarity: "rare" },
      { name: "A", rarity: "common" },
      { name: "D", rarity: "legendary" },
      { name: "E", rarity: "uncommon" }
    ];

    expect(sortWeaponsByRarity(weapons, "asc").map((weapon) => weapon.rarity)).toEqual([
      "common",
      "uncommon",
      "rare",
      "epic",
      "legendary"
    ]);

    expect(sortWeaponsByRarity(weapons, "desc").map((weapon) => weapon.rarity)).toEqual([
      "legendary",
      "epic",
      "rare",
      "uncommon",
      "common"
    ]);
  });
});
