import { readFile } from "node:fs/promises";

export interface WeaponMaterial {
  name: string;
  quantity: number;
}

export interface WeaponRefinementStat {
  label: string;
  value: string;
}

export interface WeaponRefinementRow {
  level: string;
  stats: WeaponRefinementStat[];
  materials: WeaponMaterial[];
}

export interface WeaponSocketStat {
  name: string;
  slug: string;
}

export type WeaponSockets =
  | "N/A"
  | {
      filled: number;
      total: number;
      empty: number;
      stats: WeaponSocketStat[];
    };

export interface WeaponRecord {
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
  sockets: WeaponSockets;
  craftingMaterials: WeaponMaterial[];
  refinement: WeaponRefinementRow[];
  description: string;
  source: {
    site: "crimsondesert.gg";
    url: string;
  };
}

export type WeaponListItem = Pick<
  WeaponRecord,
  "id" | "name" | "slug" | "category" | "type" | "typeLabel" | "rarity" | "character" | "stats"
>;

export interface WeaponFilterState {
  query: string;
  selectedRarities: string[];
  selectedTypes: string[];
  selectedCharacters: string[];
}

export interface WeaponDirectoryState extends WeaponFilterState {
  sort: string;
}

export interface WeaponFilterCounts {
  total: number;
  rarityCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  characterCounts: Record<string, number>;
}

const DEFAULT_WEAPON_DIRECTORY_SORT = "name-asc";

const parseDirectoryValues = (value: string | null) =>
  value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];

const matchesQuery = (weapon: Pick<WeaponRecord, "name" | "type" | "character">, query: string) => {
  if (query.length === 0) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();

  return (
    weapon.name.toLowerCase().includes(normalizedQuery) ||
    weapon.type.toLowerCase().includes(normalizedQuery) ||
    (weapon.character?.toLowerCase().includes(normalizedQuery) ?? false)
  );
};

export const loadWeapons = async (): Promise<WeaponRecord[]> =>
  JSON.parse(await readFile("data/weapons.json", "utf8"));

export const createWeaponListItems = (weapons: WeaponRecord[]): WeaponListItem[] =>
  weapons.map(({ id, name, slug, category, type, typeLabel, rarity, character, stats }) => ({
    id,
    name,
    slug,
    category,
    type,
    typeLabel,
    rarity,
    character,
    stats
  }));

export const getWeaponBySlug = (weapons: WeaponRecord[], slug: string) =>
  weapons.find((weapon) => weapon.slug === slug);

export const getStaticWeaponPaths = (weapons: WeaponRecord[]) =>
  weapons.map((weapon) => ({
    params: {
      name: weapon.slug
    }
  }));

export const getWeaponFilterCounts = (
  weapons: Pick<WeaponRecord, "name" | "type" | "rarity" | "character">[],
  filters: WeaponFilterState
): WeaponFilterCounts => {
  const query = filters.query.trim().toLowerCase();

  const queryMatches = weapons.filter((weapon) => matchesQuery(weapon, query));
  const rarityPool = queryMatches.filter(
    (weapon) =>
      filters.selectedTypes.length === 0 || filters.selectedTypes.includes(weapon.type)
  );
  const typePool = queryMatches.filter(
    (weapon) =>
      filters.selectedRarities.length === 0 || filters.selectedRarities.includes(weapon.rarity)
  );
  const characterPool = queryMatches.filter(
    (weapon) =>
      filters.selectedCharacters.length === 0 ||
      filters.selectedCharacters.includes(weapon.character ?? "")
  );

  return {
    total: queryMatches.filter(
      (weapon) =>
        (filters.selectedRarities.length === 0 ||
          filters.selectedRarities.includes(weapon.rarity)) &&
        (filters.selectedTypes.length === 0 || filters.selectedTypes.includes(weapon.type)) &&
        (filters.selectedCharacters.length === 0 ||
          filters.selectedCharacters.includes(weapon.character ?? ""))
    ).length,
    rarityCounts: Object.fromEntries(
      [...new Set(rarityPool.map((weapon) => weapon.rarity))].map((rarity) => [
        rarity,
        rarityPool.filter((weapon) => weapon.rarity === rarity).length
      ])
    ),
    typeCounts: Object.fromEntries(
      [...new Set(typePool.map((weapon) => weapon.type))].map((type) => [
        type,
        typePool.filter((weapon) => weapon.type === type).length
      ])
    ),
    characterCounts: Object.fromEntries(
      [...new Set(characterPool.map((weapon) => weapon.character ?? ""))].map((character) => [
        character,
        characterPool.filter((weapon) => (weapon.character ?? "") === character).length
      ])
    )
  };
};

export const getWeaponDirectoryStateFromSearchParams = (
  searchParams: URLSearchParams
): WeaponDirectoryState => ({
  query: searchParams.get("q")?.trim() ?? "",
  selectedRarities: parseDirectoryValues(searchParams.get("rarity")),
  selectedTypes: parseDirectoryValues(searchParams.get("type")),
  selectedCharacters: parseDirectoryValues(searchParams.get("character")),
  sort: searchParams.get("sort")?.trim() || DEFAULT_WEAPON_DIRECTORY_SORT
});

export const toWeaponDirectorySearchParams = (
  state: WeaponDirectoryState
) => {
  const searchParams = new URLSearchParams();

  if (state.query.trim().length > 0) {
    searchParams.set("q", state.query.trim());
  }

  if (state.selectedRarities.length > 0) {
    searchParams.set("rarity", state.selectedRarities.join(","));
  }

  if (state.selectedTypes.length > 0) {
    searchParams.set("type", state.selectedTypes.join(","));
  }

  if (state.selectedCharacters.length > 0) {
    searchParams.set("character", state.selectedCharacters.join(","));
  }

  if (state.sort !== DEFAULT_WEAPON_DIRECTORY_SORT) {
    searchParams.set("sort", state.sort);
  }

  return searchParams.toString();
};
