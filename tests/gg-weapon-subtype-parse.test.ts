import { describe, expect, it } from "vitest";
import {
  extractCrimsonDesertGgWeaponItemLinks,
  extractCrimsonDesertGgWeaponTypeLinks
} from "../scripts/parse/crimsondesert-gg-weapons";

describe("crimsondesert.gg weapon parsing", () => {
  it("extracts weapon type urls from the root database page", () => {
    const html = `
      <main>
        <a href="/database/weapons/one-hand-sword">Sword</a>
        <a href="/database/weapons/two-hand-spear">Spear</a>
        <a href="/database/armors/plate">Armor</a>
      </main>
    `;

    expect(extractCrimsonDesertGgWeaponTypeLinks(html)).toEqual([
      "https://crimsondesert.gg/database/weapons/one-hand-sword",
      "https://crimsondesert.gg/database/weapons/two-hand-spear"
    ]);
  });

  it("extracts item urls from a weapon subtype page", () => {
    const html = `
      <main>
        <a href="/database/weapons/one-hand-sword/acria-sword">Acria Sword</a>
        <a href="/database/weapons/one-hand-sword/wolfs-fang">Wolfs Fang</a>
        <a href="/database/weapons/one-hand-sword">Subtype</a>
      </main>
    `;

    expect(extractCrimsonDesertGgWeaponItemLinks(html)).toEqual([
      "https://crimsondesert.gg/database/weapons/one-hand-sword/acria-sword",
      "https://crimsondesert.gg/database/weapons/one-hand-sword/wolfs-fang"
    ]);
  });
});
