import { extractUniqueLinks } from "../crawl/extract-links";
import { load } from "cheerio";

export function extractCrimsonDesertGgBossLinks(html: string) {
  return extractUniqueLinks(html, "https://crimsondesert.gg", /^\/bosses\/[^/?#]+$/);
}

export function parseCrimsonDesertGgBossDetail(html: string, url: string) {
  const $ = load(html);
  const slug = url.split("/").filter(Boolean).at(-1) ?? "unknown";
  const name = $(".boss-page-title").first().text().trim() || $("h1").first().text().trim();
  const description = $(".boss-page-subtitle").first().text().trim() || $(".boss-page p").first().text().trim();
  return { id: slug, name, slug, category: "bosses" as const, type: "boss", typeLabel: "Boss", rarity: "unclassified", description, source: { site: "crimsondesert.gg" as const, url } };
}
