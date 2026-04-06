import { saveTextFile } from "../lib/raw-storage";
import { fetchHtml } from "./fetch-html";
import { crawlCrimsonDesertGgCategoryPages } from "./crimsondesert-gg-categories";

export async function crawlCrimsonDesertGgArmors() {
  const itemUrls = await crawlCrimsonDesertGgCategoryPages({
    category: "armors",
    indexUrl: "https://crimsondesert.gg/database/armor",
    listingFileStem: "armor"
  });

  await saveTextFile("data/generated/crimsondesert-gg/armors-url-manifest.json", JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: "crimsondesert-gg",
    category: "armors",
    urls: [...itemUrls]
  }, null, 2));

  for (const url of itemUrls) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "unknown";
    await saveTextFile(`sources/crimsondesert-gg/armors/${slug}.html`, await fetchHtml(url));
  }

  return itemUrls;
}
