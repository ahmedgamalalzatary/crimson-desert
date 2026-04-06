import { saveTextFile } from "../lib/raw-storage";
import { fetchHtml } from "./fetch-html";
import { extractCrimsonDesertGgBossLinks } from "../parse/crimsondesert-gg-bosses";

export async function crawlCrimsonDesertGgBosses() {
  const html = await fetchHtml("https://crimsondesert.gg/bosses");
  const itemUrls = new Set(extractCrimsonDesertGgBossLinks(html));
  await saveTextFile("data/generated/crimsondesert-gg/bosses-url-manifest.json", JSON.stringify({ generatedAt: new Date().toISOString(), source: "crimsondesert-gg", category: "bosses", urls: [...itemUrls] }, null, 2));
  for (const url of itemUrls) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "unknown";
    await saveTextFile(`sources/crimsondesert-gg/bosses/${slug}.html`, await fetchHtml(url));
  }
  return [...itemUrls];
}
