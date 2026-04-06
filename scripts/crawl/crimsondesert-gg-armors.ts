import { saveTextFile } from "../lib/raw-storage";
import { fetchHtml } from "./fetch-html";
import { extractCrimsonDesertGgArmorLinks } from "../parse/crimsondesert-gg-armors";

export async function crawlCrimsonDesertGgArmors() {
  const html = await fetchHtml("https://crimsondesert.gg/database/armor");
  const itemUrls = new Set(extractCrimsonDesertGgArmorLinks(html));

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

  return [...itemUrls];
}
