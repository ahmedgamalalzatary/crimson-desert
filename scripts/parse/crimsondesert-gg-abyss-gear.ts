import { extractUniqueLinks } from "../crawl/extract-links";
import { load } from "cheerio";

export function extractCrimsonDesertGgAbyssGearLinks(html: string) {
  return extractUniqueLinks(html, "https://crimsondesert.gg", /^\/database\/abyss-gear\/[^/?#]+$/);
}

export function parseCrimsonDesertGgAbyssGearDetail(html: string, url: string) {
  const $ = load(html);
  const slug = url.split("/").filter(Boolean).at(-1) ?? "unknown";
  return {
    id: slug,
    name: $(".db-item-name").first().text().trim(),
    slug,
    category: "abyss-gear" as const,
    type: "abyss-gear",
    typeLabel: "Abyss Gear",
    rarity: "unclassified",
    description: $(".db-item-desc").first().text().trim(),
    source: { site: "crimsondesert.gg" as const, url }
  };
}
