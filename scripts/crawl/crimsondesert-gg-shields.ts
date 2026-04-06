import { saveTextFile } from "../lib/raw-storage";
import { fetchHtml } from "./fetch-html";
import { crawlCrimsonDesertGgCategoryPages } from "./crimsondesert-gg-categories";

export async function crawlCrimsonDesertGgShields() {
  const itemUrls = await crawlCrimsonDesertGgCategoryPages({
    category: "shields",
    indexUrl: "https://crimsondesert.gg/database/shields",
    listingFileStem: "shields"
  });

  await saveTextFile("data/generated/crimsondesert-gg/shields-url-manifest.json", JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: "crimsondesert-gg",
    category: "shields",
    urls: [...itemUrls]
  }, null, 2));

  for (const url of itemUrls) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "unknown";
    await saveTextFile(`sources/crimsondesert-gg/shields/${slug}.html`, await fetchHtml(url));
  }

  return itemUrls;
}
