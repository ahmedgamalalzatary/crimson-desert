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

interface ParsedWeaponMaterial {
  name: string;
  quantity: number;
}

interface ParsedWeaponRecord {
  id: string;
  name: string;
  slug: string;
  category: "weapons";
  type: string;
  typeLabel: string;
  rarity: string;
  stats: {
    baseDamage: number | null;
    finalDamage: number | null;
  };
  materials: ParsedWeaponMaterial[];
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

export function parseCrimsonDesertGgWeaponDetail(html: string, context: ParsedWeaponContext) {
  const $ = load(html);
  const name = $(".db-item-name").first().text().trim();
  const typeLabel = $(".db-item-type").first().text().trim();
  const rarity = normalizeRarity($(".db-item-tier").first().text().trim());
  const description = $(".db-item-desc").first().text().trim();
  const stats = extractDamageByLevel($);
  const materials = extractCraftMaterials($);

  return {
    id: context.itemSlug,
    name,
    slug: context.itemSlug,
    category: "weapons" as const,
    type: context.typeSlug,
    typeLabel,
    rarity,
    stats,
    materials,
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

  const weapons = [];

  for (const entry of manifest) {
    const htmlPath = `sources/crimsondesert-gg/weapons/items/${entry.typeSlug}/${entry.itemSlug}.html`;
    const html = await readFile(htmlPath, "utf8");
    const parsed = parseCrimsonDesertGgWeaponDetail(html, {
      url: entry.url,
      typeSlug: entry.typeSlug,
      itemSlug: entry.itemSlug
    });

    weapons.push(normalizeCrimsonDesertGgWeapon(parsed));
  }

  weapons.sort((left, right) => left.name.localeCompare(right.name));

  await saveTextFile("data/weapons.json", JSON.stringify(weapons, null, 2));

  return weapons;
}
