import { extractUniqueLinks } from "../crawl/extract-links";
import { load } from "cheerio";

export function extractCrimsonDesertGgMountLinks(html: string) {
  return extractUniqueLinks(html, "https://crimsondesert.gg", /^\/mounts\/[^/?#]+$/);
}

export function parseCrimsonDesertGgMountDetail(html: string, url: string) {
  const $ = load(html);
  const slug = url.split("/").filter(Boolean).at(-1) ?? "unknown";
  const name = $("h1").first().text().trim() || $(".db-item-name").first().text().trim();
  const description = $(".db-item-desc").first().text().trim();
  const rarity = $(".db-item-tier").first().text().trim().toLowerCase() || "unclassified";
  const typeLabel = $("h2").first().text().trim() || "Mount";
  return { id: slug, name, slug, category: "mounts" as const, type: "mount", typeLabel, rarity, description, source: { site: "crimsondesert.gg" as const, url } };
}
