import { saveTextFile } from "../lib/raw-storage";
import { extractCrimsonDesertGgShieldLinks } from "../parse/crimsondesert-gg-shields";
import { fetchHtml } from "./fetch-html";

export async function crawlCrimsonDesertGgShields() {
  const itemUrls = new Set<string>();

  const html = await fetchHtml("https://crimsondesert.gg/database/shields");
  for (const url of extractCrimsonDesertGgShieldLinks(html)) {
    itemUrls.add(url);
  }

  for (const url of itemUrls) {
    const urlObj = new URL(url);
    const slug = urlObj.pathname.split("/").filter(Boolean).at(-1) ?? "unknown";
    await saveTextFile(`sources/crimsondesert-gg/shields/${slug}.html`, await fetchHtml(url));
  }

  return [...itemUrls];
}
