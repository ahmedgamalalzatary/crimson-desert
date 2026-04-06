import { saveTextFile } from "../lib/raw-storage";
import { fetchHtml } from "./fetch-html";
import { crawlCrimsonDesertGgCategoryPages } from "./crimsondesert-gg-categories";

export async function crawlCrimsonDesertGgAbyssGear() {
  const itemUrls = await crawlCrimsonDesertGgCategoryPages({
    category: "abyss-gear",
    indexUrl: "https://crimsondesert.gg/database/abyss-gear",
    listingFileStem: "abyss-gear"
  });

  await saveTextFile("data/generated/crimsondesert-gg/abyss-gear-url-manifest.json", JSON.stringify({ generatedAt: new Date().toISOString(), source: "crimsondesert-gg", category: "abyss-gear", urls: [...itemUrls] }, null, 2));
  const savedUrls: string[] = [];
  for (const url of itemUrls) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "unknown";
    try {
      await saveTextFile(`sources/crimsondesert-gg/abyss-gear/${slug}.html`, await fetchHtml(url));
      savedUrls.push(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes(": 404")) {
        throw error;
      }
    }
  }
  return savedUrls;
}
