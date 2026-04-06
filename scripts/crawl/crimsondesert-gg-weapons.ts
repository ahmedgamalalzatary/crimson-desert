import { saveTextFile } from "../lib/raw-storage";
import { fetchHtml } from "./fetch-html";
import { extractCrimsonDesertGgWeaponTypeLinks } from "../parse/crimsondesert-gg-weapons";

function getTypeSlug(url: string) {
  const segments = new URL(url).pathname.split("/").filter(Boolean);

  return segments.at(-1) ?? "unknown";
}

export async function crawlCrimsonDesertGgWeaponPages(indexHtml: string) {
  const typeUrls = extractCrimsonDesertGgWeaponTypeLinks(indexHtml);

  for (const typeUrl of typeUrls) {
    const html = await fetchHtml(typeUrl);
    const typeSlug = getTypeSlug(typeUrl);

    await saveTextFile(`sources/crimsondesert-gg/weapons/${typeSlug}.html`, html);
  }

  return typeUrls;
}
