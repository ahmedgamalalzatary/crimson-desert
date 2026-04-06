import { saveTextFile } from "../lib/raw-storage";
import { fetchHtml } from "./fetch-html";
import { extractCrimsonDesertGgAbyssGearLinks } from "../parse/crimsondesert-gg-abyss-gear";

export async function crawlCrimsonDesertGgAbyssGear() {
  const html = await fetchHtml("https://crimsondesert.gg/database/abyss-gear");
  const itemUrls = new Set(extractCrimsonDesertGgAbyssGearLinks(html));
  await saveTextFile("data/generated/crimsondesert-gg/abyss-gear-url-manifest.json", JSON.stringify({ generatedAt: new Date().toISOString(), source: "crimsondesert-gg", category: "abyss-gear", urls: [...itemUrls] }, null, 2));
  for (const url of itemUrls) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "unknown";
    await saveTextFile(`sources/crimsondesert-gg/abyss-gear/${slug}.html`, await fetchHtml(url));
  }
  return [...itemUrls];
}
