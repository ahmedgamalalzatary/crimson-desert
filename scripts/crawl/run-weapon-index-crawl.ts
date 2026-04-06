import { crawlCrimsonDesertGgWeaponPages } from "./crimsondesert-gg-weapons";
import { fetchHtml } from "./fetch-html";
import { saveTextFile } from "../lib/raw-storage";
import { getCategorySourceTargets, getRawHtmlPath } from "../lib/sources";

export async function runWeaponIndexCrawl() {
  const targets = getCategorySourceTargets("weapons");

  for (const target of targets) {
    const html = await fetchHtml(target.indexUrl);
    const outputPath = getRawHtmlPath({
      sourceId: target.sourceId,
      category: target.category,
      slug: "index"
    });

    await saveTextFile(outputPath, html);

    if (target.sourceId === "crimsondesert-gg") {
      await crawlCrimsonDesertGgWeaponPages(html);
    }
  }
}
