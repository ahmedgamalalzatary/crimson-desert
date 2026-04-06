import { describe, expect, it } from "vitest";
import { cleanWeaponSchema } from "../scripts/lib/schema";

describe("cleanWeaponSchema", () => {
  it("accepts the final website weapon shape", () => {
    const parsed = cleanWeaponSchema.parse({
      id: "black-iron-axe",
      name: "Black Iron Axe",
      slug: "black-iron-axe",
      category: "weapons",
      type: "one-hand-axe",
      typeLabel: "Axe",
      rarity: "epic",
      stats: {
        baseDamage: 12,
        finalDamage: 34
      },
      sockets: {
        filled: 0,
        total: 3,
        empty: 3,
        stats: []
      },
      materials: [
        { name: "Iron Ore", quantity: 19 },
        { name: "Copper Ore", quantity: 8 }
      ],
      description: "An axe featuring an imposing black blade.",
      source: {
        site: "crimsondesert.gg",
        url: "https://crimsondesert.gg/database/weapons/one-hand-axe/black-iron-axe"
      }
    });

    expect(parsed.stats.finalDamage).toBeGreaterThan(parsed.stats.baseDamage);
    expect(parsed.sockets).not.toBe("N/A");
  });
});
