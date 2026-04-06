import { readFile } from "node:fs/promises";

export interface WeaponMaterial {
  name: string;
  quantity: number;
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
  stats: {
    baseDamage: number | null;
    finalDamage: number | null;
  };
  sockets: WeaponSockets;
  materials: WeaponMaterial[];
  description: string;
  source: {
    site: "crimsondesert.gg";
    url: string;
  };
}

export type WeaponListItem = Pick<
  WeaponRecord,
  "id" | "name" | "slug" | "category" | "type" | "typeLabel" | "rarity" | "stats"
>;

export interface WeaponFilterState {
  query: string;
  selectedRarities: string[];
  selectedTypes: string[];
}

export interface WeaponFilterCounts {
  total: number;
  rarityCounts: Record<string, number>;
  typeCounts: Record<string, number>;
}

const matchesQuery = (weapon: Pick<WeaponRecord, "name" | "type">, query: string) => {
  if (query.length === 0) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();

  return (
    weapon.name.toLowerCase().includes(normalizedQuery) ||
    weapon.type.toLowerCase().includes(normalizedQuery)
  );
};

export const loadWeapons = async (): Promise<WeaponRecord[]> =>
  JSON.parse(await readFile("data/weapons.json", "utf8"));

export const createWeaponListItems = (weapons: WeaponRecord[]): WeaponListItem[] =>
  weapons.map(({ id, name, slug, category, type, typeLabel, rarity, stats }) => ({
    id,
    name,
    slug,
    category,
    type,
    typeLabel,
    rarity,
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
  weapons: Pick<WeaponRecord, "name" | "type" | "rarity">[],
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

  return {
    total: queryMatches.filter(
      (weapon) =>
        (filters.selectedRarities.length === 0 ||
          filters.selectedRarities.includes(weapon.rarity)) &&
        (filters.selectedTypes.length === 0 || filters.selectedTypes.includes(weapon.type))
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
    )
  };
};
