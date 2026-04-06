import { saveTextFile } from "../lib/raw-storage";
import { fetchHtml } from "./fetch-html";
import { extractCrimsonDesertGgMountLinks } from "../parse/crimsondesert-gg-mounts";

export async function crawlCrimsonDesertGgMounts() {
  const html = await fetchHtml("https://crimsondesert.gg/mounts");
  const itemUrls = new Set(extractCrimsonDesertGgMountLinks(html));
  await saveTextFile("data/generated/crimsondesert-gg/mounts-url-manifest.json", JSON.stringify({ generatedAt: new Date().toISOString(), source: "crimsondesert-gg", category: "mounts", urls: [...itemUrls] }, null, 2));
  for (const url of itemUrls) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "unknown";
    await saveTextFile(`sources/crimsondesert-gg/mounts/${slug}.html`, await fetchHtml(url));
  }
  return [...itemUrls];
}
