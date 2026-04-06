import { describe, expect, it } from "vitest";
import { extractUniqueLinks } from "../scripts/crawl/extract-links";

describe("extractUniqueLinks", () => {
  it("returns absolute urls for matching anchors", () => {
    const html = `
      <main>
        <a href="/weapons/ashen-blade">Ashen Blade</a>
        <a href="/weapons/mooncleaver">Mooncleaver</a>
      </main>
    `;

    const links = extractUniqueLinks(html, "https://crimsondesert.gg", /^\/weapons\//);

    expect(links).toEqual([
      "https://crimsondesert.gg/weapons/ashen-blade",
      "https://crimsondesert.gg/weapons/mooncleaver"
    ]);
  });

  it("deduplicates repeated links and ignores non-matches", () => {
    const html = `
      <main>
        <a href="/weapons/ashen-blade">Ashen Blade</a>
        <a href="/weapons/ashen-blade">Ashen Blade</a>
        <a href="/bosses/red-wolf">Red Wolf</a>
      </main>
    `;

    const links = extractUniqueLinks(html, "https://crimsondesert.gg", /^\/weapons\//);

    expect(links).toEqual(["https://crimsondesert.gg/weapons/ashen-blade"]);
  });
});
