import { readFile } from "node:fs/promises";

export type CategoryId =
  | "weapons"
  | "armors"
  | "shields"
  | "abyss-gear"
  | "bosses"
  | "mounts"
  | "quests-main"
  | "quests-faction";

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  href: string;
  icon: string;
  description: string;
  dataPath: string;
}

export const categoryConfigs: CategoryConfig[] = [
  { id: "weapons", label: "Weapons", href: "/weapons", icon: "⚔️", description: "Swords, bows, staves and more", dataPath: "data/weapons.json" },
  { id: "armors", label: "Armors", href: "/armors", icon: "🛡️", description: "Chest, helm, gloves and boots", dataPath: "data/armors.json" },
  { id: "shields", label: "Shields", href: "/shields", icon: "🔰", description: "Block and parry gear", dataPath: "data/shields.json" },
  { id: "abyss-gear", label: "Abyss Gear", href: "/abyss-gear", icon: "🌀", description: "Rare abyss dungeon drops", dataPath: "data/abyss-gear.json" },
  { id: "bosses", label: "Bosses", href: "/bosses", icon: "👹", description: "World and dungeon bosses", dataPath: "data/bosses.json" },
  { id: "mounts", label: "Mounts", href: "/mounts", icon: "🐴", description: "Horses, camels and more", dataPath: "data/mounts.json" },
  { id: "quests-main", label: "Main Quests", href: "/quests", icon: "📜", description: "Main quest lines", dataPath: "data/quests-main.json" },
  { id: "quests-faction", label: "Faction Quests", href: "/quests", icon: "📜", description: "Faction quest lines", dataPath: "data/quests-faction.json" }
];

export async function loadJsonArray<T>(path: string): Promise<T[]> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T[];
  } catch {
    return [];
  }
}
