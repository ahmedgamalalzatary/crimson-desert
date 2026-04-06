import { describe, expect, it } from "vitest";
import { collectCrimsonDesertGgWeaponItemUrls } from "../scripts/parse/write-weapon-url-manifest";

describe("collectCrimsonDesertGgWeaponItemUrls", () => {
  it("collects unique item urls from multiple subtype pages", () => {
    const urls = collectCrimsonDesertGgWeaponItemUrls([
      `
        <a href="/database/weapons/one-hand-sword/acria-sword">Acria Sword</a>
        <a href="/database/weapons/one-hand-sword/wolfs-fang">Wolfs Fang</a>
      `,
      `
        <a href="/database/weapons/one-hand-sword/wolfs-fang">Wolfs Fang</a>
        <a href="/database/weapons/two-hand-spear/sky-piercer">Sky Piercer</a>
      `
    ]);

    expect(urls).toEqual([
      "https://crimsondesert.gg/database/weapons/one-hand-sword/acria-sword",
      "https://crimsondesert.gg/database/weapons/one-hand-sword/wolfs-fang",
      "https://crimsondesert.gg/database/weapons/two-hand-spear/sky-piercer"
    ]);
  });
});
