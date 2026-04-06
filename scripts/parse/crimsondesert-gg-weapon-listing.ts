export interface WeaponListingEntry {
  name: string;
  typeLabel: string;
  characters: string;
  primaryStatLabel: string | null;
  primaryStatValue: string | null;
  href: string;
}

interface ParseListingOptions {
  typeSlug: string;
  baseUrl: string;
}

export function slugifyWeaponName(name: string) {
  return name
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseWeaponListingText(text: string, options: ParseListingOptions) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const countLine = lines.find((line) => /^All \d+ /i.test(line));

  if (!countLine) {
    throw new Error("Unable to find listing count line.");
  }

  const totalCount = Number(countLine.match(/^All (\d+) /i)?.[1] ?? 0);
  const nameHeaderIndex = lines.indexOf("Name");

  if (nameHeaderIndex === -1) {
    throw new Error("Unable to find listing header.");
  }

  const footerIndex = lines.findIndex((line, index) => index > nameHeaderIndex && line === "Comprehensive Crimson Desert database with items, weapons, armor, bosses, quests, pets, mounts, skill trees, and an interactive world map.");
  const contentLines = lines.slice(nameHeaderIndex + 1, footerIndex === -1 ? undefined : footerIndex);
  const entries: WeaponListingEntry[] = [];
  let index = 0;

  while (index < contentLines.length) {
    const name = contentLines[index];
    const typeLabel = contentLines[index + 1];
    const characters = contentLines[index + 2];
    const statLabel = contentLines[index + 3];
    const statValue = contentLines[index + 4];

    if (!name || !typeLabel || !characters) {
      break;
    }

    if (statLabel === "Attack" && statValue) {
      entries.push({
        name,
        typeLabel,
        characters,
        primaryStatLabel: statLabel,
        primaryStatValue: statValue,
        href: `${options.baseUrl}/database/weapons/${options.typeSlug}/${slugifyWeaponName(name)}`
      });
      index += 5;
      continue;
    }

    entries.push({
      name,
      typeLabel,
      characters,
      primaryStatLabel: null,
      primaryStatValue: null,
      href: `${options.baseUrl}/database/weapons/${options.typeSlug}/${slugifyWeaponName(name)}`
    });
    index += 3;
  }

  return { totalCount, entries };
}
