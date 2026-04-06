import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { cleanWeaponSchema } from "../lib/schema";
import { saveTextFile } from "../lib/raw-storage";

interface WeaponManifestEntry {
  source: string;
  url: string;
  typeSlug: string;
  itemSlug: string;
}

interface ParsedWeaponContext {
  url: string;
  typeSlug: string;
  itemSlug: string;
}

interface RenderedListingEntry {
  entryId: string;
  source: string;
  href: string;
  name: string;
  typeLabel: string;
  characters: string;
  primaryStatLabel: string | null;
  primaryStatValue: string | null;
}

interface ParsedWeaponMaterial {
  name: string;
  quantity: number;
}

interface ParsedWeaponSocketStat {
  name: string;
  slug: string;
}

interface ParsedWeaponRefinementStat {
  label: string;
  value: string;
}

interface ParsedWeaponRefinementRow {
  level: string;
  stats: ParsedWeaponRefinementStat[];
  materials: ParsedWeaponMaterial[];
}

interface ParsedWeaponSockets {
  filled: number;
  total: number;
  empty: number;
  stats: ParsedWeaponSocketStat[];
}

interface ParsedWeaponRecord {
  id: string;
  name: string;
  slug: string;
  category: "weapons";
  type: string;
  typeLabel: string;
  rarity: string;
  character: string | null;
  stats: {
    baseDamage: number | null;
    finalDamage: number | null;
  };
  sockets: ParsedWeaponSockets | "N/A";
  craftingMaterials: ParsedWeaponMaterial[];
  refinement: ParsedWeaponRefinementRow[];
  description: string;
  source: {
    site: "crimsondesert.gg";
    url: string;
  };
}

function parseNumber(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function normalizeRarity(value: string) {
  return value.trim().toLowerCase();
}

function extractDamageByLevel($: ReturnType<typeof load>) {
  const enchantRows = $("tr")
    .map((_, row) => {
      const level = $(row).find("td.db-enchant-level").first().text().trim();

      if (!level) {
        return null;
      }

      const statLines = $(row).find(".db-enchant-stat-line");
      let attackValue: number | null = null;

      statLines.each((_, line) => {
        const label = $(line).find(".db-enchant-stat-label").first().text().trim();

        if (label !== "Attack") {
          return;
        }

        const value = parseNumber($(line).find(".db-enchant-stat-val").first().text().trim());
        if (value !== null) {
          attackValue = value;
        }
      });

      return attackValue === null ? null : { level, attackValue };
    })
    .get()
    .filter((row): row is { level: string; attackValue: number } => row !== null);

  if (enchantRows.length > 0) {
    const baseDamage = enchantRows.find((row) => row.level === "+0")?.attackValue ?? null;
    const finalDamage = enchantRows.at(-1)?.attackValue ?? baseDamage;

    return { baseDamage, finalDamage };
  }

  const flatAttackValue = $(".db-stat-row")
    .map((_, row) => {
      const label = $(row).find(".db-stat-label").first().text().trim();

      if (label !== "Attack") {
        return null;
      }

      return parseNumber($(row).find(".db-stat-value").first().text().trim());
    })
    .get()
    .find((value): value is number => value !== null);

  return {
    baseDamage: flatAttackValue ?? null,
    finalDamage: flatAttackValue ?? null
  };
}

function extractCraftMaterials($: ReturnType<typeof load>) {
  return $(".db-craft-materials .db-craft-mat")
    .map((_, element) => {
      const name = $(element).find(".db-craft-mat-name").first().text().trim();
      const quantity = parseNumber(
        $(element).find(".db-craft-mat-count").first().text().trim()
      );

      if (!name || quantity === null) {
        return null;
      }

      return {
        name,
        quantity
      };
    })
    .get()
    .filter((entry): entry is ParsedWeaponMaterial => entry !== null);
}

function extractRefinement($: ReturnType<typeof load>) {
  return $("tr")
    .map((_, row) => {
      const level = $(row).find("td.db-enchant-level").first().text().trim();

      if (!level) {
        return null;
      }

      const stats = $(row)
        .find(".db-enchant-stats-cell .db-enchant-stat-line")
        .map((__, statLine) => {
          const label = $(statLine).find(".db-enchant-stat-label").first().text().trim();
          const value = $(statLine).find(".db-enchant-stat-val").first().text().trim();

          if (!label || !value) {
            return null;
          }

          return { label, value };
        })
        .get()
        .filter((entry): entry is ParsedWeaponRefinementStat => entry !== null);

      const materials = $(row)
        .find(".db-enchant-mats-cell > .db-enchant-mat-row:first-child .db-enchant-mat-pill")
        .map((__, element) => {
          const name = $(element).find(".db-enchant-mat-name").first().text().trim();
          const quantity = parseNumber(
            $(element).find(".db-enchant-mat-qty").first().text().trim()
          );

          if (!name || quantity === null) {
            return null;
          }

          return {
            name,
            quantity
          };
        })
        .get()
        .filter((entry): entry is ParsedWeaponMaterial => entry !== null);

      return {
        level,
        stats,
        materials
      };
    })
    .get()
    .filter((entry): entry is ParsedWeaponRefinementRow => entry !== null);
}

function extractSockets($: ReturnType<typeof load>): ParsedWeaponSockets | "N/A" {
  const socketLabel = $(".db-socket-label").first().text().trim();

  if (!socketLabel) {
    return "N/A";
  }

  const labelMatch = socketLabel.match(/(\d+)\s*\/\s*(\d+)\s*sockets/i);
  const filled =
    parseNumber(labelMatch?.[1] ?? "") ??
    $(".db-socket-slot.filled").length;
  const total =
    parseNumber(labelMatch?.[2] ?? "") ??
    $(".db-socket-slot").length;
  const empty =
    parseNumber(socketLabel.match(/\((\d+)\s*empty\)/i)?.[1] ?? "") ??
    Math.max(total - filled, 0);

  const stats = $(".db-socket-row")
    .map((_, row) => {
      const name = $(row).find(".db-stat-label").first().text().trim();
      const href = $(row).attr("href")?.trim() ?? "";
      const slug = href.split("/").filter(Boolean).at(-1) ?? "";

      if (!name || !slug) {
        return null;
      }

      return {
        name,
        slug
      };
    })
    .get()
    .filter((entry): entry is ParsedWeaponSocketStat => entry !== null);

  return {
    filled,
    total,
    empty,
    stats
  };
}

export function parseCrimsonDesertGgWeaponDetail(
  html: string,
  context: ParsedWeaponContext,
  character: string | null = null
) {
  const $ = load(html);
  const name = $(".db-item-name").first().text().trim();
  const typeLabel = $(".db-item-type").first().text().trim();
  const rarity = normalizeRarity($(".db-item-tier").first().text().trim());
  const description = $(".db-item-desc").first().text().trim();
  const stats = extractDamageByLevel($);
  const sockets = extractSockets($);
  const craftingMaterials = extractCraftMaterials($);
  const refinement = extractRefinement($);

  return {
    id: context.itemSlug,
    name,
    slug: context.itemSlug,
    category: "weapons" as const,
    type: context.typeSlug,
    typeLabel,
    rarity,
    character,
    stats,
    sockets,
    craftingMaterials,
    refinement,
    description,
    source: {
      site: "crimsondesert.gg" as const,
      url: context.url
    }
  };
}

export function normalizeCrimsonDesertGgWeapon(record: ParsedWeaponRecord) {
  return cleanWeaponSchema.parse(record);
}

export async function normalizeCrimsonDesertGgWeapons() {
  const manifest = JSON.parse(
    await readFile("data/generated/crimsondesert-gg/weapons-unique-detail-pages.json", "utf8")
  ) as WeaponManifestEntry[];

  let characterByUrl: Record<string, string> = {};
  try {
    const renderedListings = JSON.parse(
      await readFile("data/generated/crimsondesert-gg/weapons-rendered-listings.json", "utf8")
    ) as RenderedListingEntry[];
    characterByUrl = renderedListings.reduce((acc, entry) => {
      if (entry.characters) {
        acc[entry.href] = entry.characters;
      }
      return acc;
    }, {} as Record<string, string>);
  } catch {
    console.warn("No rendered listings found, character data will not be populated");
  }

  const weapons = [];

  for (const entry of manifest) {
    const htmlPath = `sources/crimsondesert-gg/weapons/items/${entry.typeSlug}/${entry.itemSlug}.html`;
    const html = await readFile(htmlPath, "utf8");
    const character = characterByUrl[entry.url] ?? null;
    const parsed = parseCrimsonDesertGgWeaponDetail(html, {
      url: entry.url,
      typeSlug: entry.typeSlug,
      itemSlug: entry.itemSlug
    }, character);

    weapons.push(normalizeCrimsonDesertGgWeapon(parsed));
  }

  weapons.sort((left, right) => left.name.localeCompare(right.name));

  await saveTextFile("data/weapons.json", JSON.stringify(weapons, null, 2));

  return weapons;
}
