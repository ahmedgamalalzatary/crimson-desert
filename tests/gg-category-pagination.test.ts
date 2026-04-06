import { describe, expect, it } from "vitest";
import {
  extractCrimsonDesertGgCategoryPageCount,
  collectCrimsonDesertGgCategoryItemUrls
} from "../scripts/crawl/crimsondesert-gg-categories";

describe("crimsondesert.gg category pagination", () => {
  it("reads the total page count from the listing footer", () => {
    expect(extractCrimsonDesertGgCategoryPageCount("<div class='db-pagination'><span>Page 1 of 10</span></div>")).toBe(10);
    expect(extractCrimsonDesertGgCategoryPageCount("<main>No pagination</main>")).toBe(1);
  });

  it("deduplicates item urls from multiple listing pages", () => {
    const urls = collectCrimsonDesertGgCategoryItemUrls([
      `<a href="/database/armor/helm/alpha-wolf-helm">Alpha</a><a href="/database/armor/helm/beta-helm">Beta</a>`,
      `<a href="/database/armor/helm/beta-helm">Beta</a><a href="/database/armor/helm/gamma-helm">Gamma</a>`
    ], "https://crimsondesert.gg", /^\/database\/armor\/[^/?#]+\/[^/?#]+$/);

    expect(urls).toEqual([
      "https://crimsondesert.gg/database/armor/helm/alpha-wolf-helm",
      "https://crimsondesert.gg/database/armor/helm/beta-helm",
      "https://crimsondesert.gg/database/armor/helm/gamma-helm"
    ]);
  });
});
