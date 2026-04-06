import { saveTextFile } from "../lib/raw-storage";
import { fetchHtml } from "./fetch-html";

export function getCrimsonDesertGgWeaponItemPath(url: string) {
  const segments = new URL(url).pathname.split("/").filter(Boolean);
  const typeSlug = segments.at(-2);
  const itemSlug = segments.at(-1);

  if (!typeSlug || !itemSlug) {
    throw new Error(`Invalid weapon item URL: ${url}`);
  }

  return `sources/crimsondesert-gg/weapons/items/${typeSlug}/${itemSlug}.html`;
}

export async function crawlCrimsonDesertGgWeaponItems(itemUrls: string[], limit?: number) {
  const urls = typeof limit === "number" ? itemUrls.slice(0, limit) : itemUrls;

  for (const url of urls) {
    const html = await fetchHtml(url);
    const outputPath = getCrimsonDesertGgWeaponItemPath(url);

    await saveTextFile(outputPath, html);
  }

  return urls.length;
}
