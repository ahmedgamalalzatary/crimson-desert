import { describe, expect, it } from "vitest";
import { getCrimsonDesertGgWeaponItemPath } from "../scripts/crawl/crimsondesert-gg-weapon-items";

describe("getCrimsonDesertGgWeaponItemPath", () => {
  it("maps a weapon item url to a nested raw html path", () => {
    const path = getCrimsonDesertGgWeaponItemPath(
      "https://crimsondesert.gg/database/weapons/one-hand-sword/acria-sword"
    );

    expect(path).toBe("sources/crimsondesert-gg/weapons/items/one-hand-sword/acria-sword.html");
  });
});
