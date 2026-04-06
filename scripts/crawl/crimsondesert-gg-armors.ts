import { saveTextFile } from "../lib/raw-storage";
import { extractCrimsonDesertGgArmorLinks } from "../parse/crimsondesert-gg-armors";
import { fetchHtml } from "./fetch-html";

export async function crawlCrimsonDesertGgArmors() {
  const itemUrls = new Set<string>();

  const html = await fetchHtml("https://crimsondesert.gg/database/armor");
  for (const url of extractCrimsonDesertGgArmorLinks(html)) {
    itemUrls.add(url);
  }

  for (const url of itemUrls) {
    const urlObj = new URL(url);
    const slug = urlObj.pathname.split("/").filter(Boolean).at(-1) ?? "unknown";
    await saveTextFile(`sources/crimsondesert-gg/armors/${slug}.html`, await fetchHtml(url));
  }

  return [...itemUrls];
}
