import { saveTextFile } from "../lib/raw-storage";
import { fetchHtml } from "./fetch-html";
import { extractCrimsonDesertGgShieldLinks } from "../parse/crimsondesert-gg-shields";

export async function crawlCrimsonDesertGgShields() {
  const html = await fetchHtml("https://crimsondesert.gg/database/shields");
  const itemUrls = new Set(extractCrimsonDesertGgShieldLinks(html));

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

  return [...itemUrls];
}
