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
    expect(parsed.sockets).toBe("N/A");
  });

  it("extracts attack from the newer flat stats layout", async () => {
    const html = await readFile(
      "sources/crimsondesert-gg/weapons/items/two-hand-lightningthrower/kuku-boltspitter.html",
      "utf8"
    );

    const parsed = parseCrimsonDesertGgWeaponDetail(html, {
      url: "https://crimsondesert.gg/database/weapons/two-hand-lightningthrower/kuku-boltspitter",
      typeSlug: "two-hand-lightningthrower",
      itemSlug: "kuku-boltspitter"
    });

    expect(parsed.stats).toEqual({
      baseDamage: 25,
      finalDamage: 25
    });
  });

  it("extracts full socket details when the source page includes sockets", async () => {
    const html = await readFile(
      "sources/crimsondesert-gg/weapons/items/one-hand-cannon/wyvern-blaster.html",
      "utf8"
    );

    const parsed = parseCrimsonDesertGgWeaponDetail(html, {
      url: "https://crimsondesert.gg/database/weapons/one-hand-cannon/wyvern-blaster",
      typeSlug: "one-hand-cannon",
      itemSlug: "wyvern-blaster"
    });

    expect(parsed.sockets).toEqual({
      filled: 3,
      total: 5,
      empty: 2,
      stats: [
        {
          name: "+4% damage to mighty foes",
          slug: "malicebane-i"
        },
        {
          name: "Attack +1",
          slug: "destruction-i"
        },
        {
          name: "Attack Speed Lv.1",
          slug: "swift-i"
        }
      ]
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
