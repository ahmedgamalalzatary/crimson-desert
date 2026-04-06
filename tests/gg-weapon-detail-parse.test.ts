import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  normalizeCrimsonDesertGgWeapon,
  parseCrimsonDesertGgWeaponDetail
} from "../scripts/normalize/crimsondesert-gg-weapons";

describe("parseCrimsonDesertGgWeaponDetail", () => {
  it("extracts the clean weapon fields from a craftable weapon page", async () => {
    const html = await readFile(
      "sources/crimsondesert-gg/weapons/items/one-hand-axe/black-iron-axe.html",
      "utf8"
    );

    const parsed = parseCrimsonDesertGgWeaponDetail(html, {
      url: "https://crimsondesert.gg/database/weapons/one-hand-axe/black-iron-axe",
      typeSlug: "one-hand-axe",
      itemSlug: "black-iron-axe"
    });

    expect(parsed).toMatchObject({
      id: "black-iron-axe",
      name: "Black Iron Axe",
      slug: "black-iron-axe",
      category: "weapons",
      type: "one-hand-axe",
      rarity: "epic",
      stats: {
        baseDamage: 12,
        finalDamage: 34
      },
      materials: [
        { name: "Iron Ore", quantity: 19 },
        { name: "Copper Ore", quantity: 8 }
      ],
      description:
        "An axe featuring an imposing black blade. Blacksmiths of old believed that forging weapons with black blades would allow the wielder to absorb the souls of fallen enemies. While the era of such superstition has passed, the tradition of crafting weapons from black iron remains.",
      source: {
        site: "crimsondesert.gg",
        url: "https://crimsondesert.gg/database/weapons/one-hand-axe/black-iron-axe"
      }
    });
  });

  it("keeps empty crafting materials as an empty list", async () => {
    const html = await readFile(
      "sources/crimsondesert-gg/weapons/items/gauntlet/furious-waves-gauntlet.html",
      "utf8"
    );

    const parsed = parseCrimsonDesertGgWeaponDetail(html, {
      url: "https://crimsondesert.gg/database/weapons/gauntlet/furious-waves-gauntlet",
      typeSlug: "gauntlet",
      itemSlug: "furious-waves-gauntlet"
    });

    expect(parsed.materials).toEqual([]);
    expect(parsed.stats).toEqual({
      baseDamage: 28,
      finalDamage: 28
    });
  });
});

describe("normalizeCrimsonDesertGgWeapon", () => {
  it("normalizes display type and rarity into clean searchable values", async () => {
    const html = await readFile(
      "sources/crimsondesert-gg/weapons/items/gauntlet/furious-waves-gauntlet.html",
      "utf8"
    );

    const parsed = parseCrimsonDesertGgWeaponDetail(html, {
      url: "https://crimsondesert.gg/database/weapons/gauntlet/furious-waves-gauntlet",
      typeSlug: "gauntlet",
      itemSlug: "furious-waves-gauntlet"
    });

    const normalized = normalizeCrimsonDesertGgWeapon(parsed);

    expect(normalized.typeLabel).toBe("Gauntlets");
    expect(normalized.rarity).toBe("epic");
  });
});
