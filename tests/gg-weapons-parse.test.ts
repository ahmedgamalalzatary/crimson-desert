import { describe, expect, it } from "vitest";
import { extractCrimsonDesertGgWeaponLinks } from "../scripts/parse/crimsondesert-gg-weapons";

describe("extractCrimsonDesertGgWeaponLinks", () => {
  it("extracts unique weapon detail urls from database html", () => {
    const html = `
      <main>
        <a href="/database/weapons/one-hand-sword">Sword</a>
        <a href="/database/weapons/two-hand-spear">Spear</a>
        <a href="/database/bosses/red-wolf">Boss</a>
        <a href="/database/weapons/one-hand-sword">Sword Again</a>
      </main>
    `;

    expect(extractCrimsonDesertGgWeaponLinks(html)).toEqual([
      "https://crimsondesert.gg/database/weapons/one-hand-sword",
      "https://crimsondesert.gg/database/weapons/two-hand-spear"
    ]);
  });
});
