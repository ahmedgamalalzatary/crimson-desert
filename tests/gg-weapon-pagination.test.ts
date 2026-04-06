import { describe, expect, it } from "vitest";
import {
  extractCrimsonDesertGgWeaponPageCount,
  getCrimsonDesertGgWeaponPagePath
} from "../scripts/crawl/crimsondesert-gg-weapons";

describe("crimsondesert.gg weapon listing pagination", () => {
  it("defaults to a single page when no pagination is rendered", () => {
    expect(extractCrimsonDesertGgWeaponPageCount("<main>No pagination</main>")).toBe(1);
  });

  it("extracts the total page count from a paginated subtype listing", () => {
    const html = `
      <div class="db-pagination">
        <button class="db-page-btn" disabled>« Prev</button>
        <span class="db-page-info">Page 1 of 2</span>
        <button class="db-page-btn">Next »</button>
      </div>
    `;

    expect(extractCrimsonDesertGgWeaponPageCount(html)).toBe(2);
  });

  it("writes extra subtype listing pages to distinct raw html files", () => {
    expect(getCrimsonDesertGgWeaponPagePath("two-hand-pike", 1)).toBe(
      "sources/crimsondesert-gg/weapons/two-hand-pike.html"
    );
    expect(getCrimsonDesertGgWeaponPagePath("two-hand-pike", 2)).toBe(
      "sources/crimsondesert-gg/weapons/two-hand-pike.page-2.html"
    );
  });
});
