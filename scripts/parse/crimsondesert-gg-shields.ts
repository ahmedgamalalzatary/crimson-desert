import { extractUniqueLinks } from "../crawl/extract-links";
import { load } from "cheerio";

export function extractCrimsonDesertGgShieldLinks(html: string) {
  return extractUniqueLinks(html, "https://crimsondesert.gg", /^\/database\/shields\/[^/?#]+\/[^/?#]+$/);
}

function parseNumber(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function parseCrimsonDesertGgShieldDetail(html: string, url: string) {
  const $ = load(html);
  const slug = url.split("/").filter(Boolean).at(-1) ?? "unknown";
  const name = $(".db-item-name").first().text().trim();
  const typeLabel = $(".db-item-type").first().text().trim();
  const rarity = $(".db-item-tier").first().text().trim().toLowerCase();
  const description = $(".db-item-desc").first().text().trim();
  const stats = $(".db-stat-row")
    .map((_, row) => {
      const label = $(row).find(".db-stat-label").first().text().trim();
      const value = $(row).find(".db-stat-value").first().text().trim();
      const max = $(row).find(".db-stat-max").first().text().trim();
      if (!label || !value) return null;
      return { label, value, ...(max ? { max } : {}) };
    })
    .get();
  const refinement = $("tr")
    .map((_, row) => {
      const level = $(row).find(".db-enchant-level").first().text().trim();
      if (!level) return null;
      const statLines = $(row)
        .find(".db-enchant-stat-line")
        .map((__, line) => {
          const label = $(line).find(".db-enchant-stat-label").first().text().trim();
          const value = $(line).find(".db-enchant-stat-val").first().text().trim();
          if (!label || !value) return null;
          return { label, value };
        })
        .get()
        .filter(Boolean);
      const materials = $(row)
        .find(".db-enchant-mat-pill")
        .map((__, pill) => {
          const name = $(pill).find(".db-enchant-mat-name").first().text().trim();
          const quantity = parseNumber($(pill).find(".db-enchant-mat-qty").first().text().trim());
          if (!name || !quantity) return null;
          return { name, quantity };
        })
        .get()
        .filter(Boolean);
      return { level, stats: statLines, materials };
    })
    .get()
    .filter(Boolean);
  const craftingMaterials = $(".db-craft-materials .db-craft-mat")
    .map((_, element) => {
      const name = $(element).find(".db-craft-mat-name").first().text().trim();
      const quantity = parseNumber($(element).find(".db-craft-mat-count").first().text().trim());
      if (!name || !quantity) return null;
      return { name, quantity };
    })
    .get()
    .filter(Boolean);

  return {
    id: slug,
    name,
    slug,
    category: "shields" as const,
    type: slug.split("-").slice(0, -1).join("-") || slug,
    typeLabel,
    rarity,
    stats,
    refinement,
    craftingMaterials,
    description,
    source: { site: "crimsondesert.gg" as const, url }
  };
}
