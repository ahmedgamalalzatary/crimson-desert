import { extractUniqueLinks } from "../crawl/extract-links";
import { load } from "cheerio";

export function extractCrimsonDesertGgQuestLinks(html: string) {
  return extractUniqueLinks(html, "https://crimsondesert.gg", /^\/quests\/[^/?#]+$/);
}

export function extractCrimsonDesertGgFactionQuestLinks(html: string) {
  return extractUniqueLinks(html, "https://crimsondesert.gg", /^\/faction-quests\/[^/?#]+$/);
}

export function parseCrimsonDesertGgQuestDetail(html: string, url: string, category: "quests-main" | "quests-faction") {
  const $ = load(html);
  const slug = url.split("/").filter(Boolean).at(-1) ?? "unknown";
  const name = $(".quest-page-title h1, h1").first().text().trim();
  const description = $(".quest-page-subtitle, .quest-guide-summary").first().text().trim();
  return { id: slug, name, slug, category, type: "quest", typeLabel: category === "quests-main" ? "Main Quest" : "Faction Quest", rarity: "unclassified", description, source: { site: "crimsondesert.gg" as const, url } };
}
