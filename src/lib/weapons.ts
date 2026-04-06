import { readFile } from "node:fs/promises";

export interface WeaponMaterial {
  name: string;
  quantity: number;
}

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
