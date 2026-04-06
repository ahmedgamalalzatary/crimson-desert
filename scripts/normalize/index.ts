import { normalizeCrimsonDesertGgWeapons } from "./crimsondesert-gg-weapons";
import { normalizeCrimsonDesertGgArmors } from "./crimsondesert-gg-armors";
import { normalizeCrimsonDesertGgShields } from "./crimsondesert-gg-shields";
import { normalizeCrimsonDesertGgAbyssGear } from "./crimsondesert-gg-abyss-gear";
import { normalizeCrimsonDesertGgMounts } from "./crimsondesert-gg-mounts";
import { normalizeCrimsonDesertGgBosses } from "./crimsondesert-gg-bosses";
import { normalizeCrimsonDesertGgQuests } from "./crimsondesert-gg-quests";

const weapons = await normalizeCrimsonDesertGgWeapons();
await normalizeCrimsonDesertGgArmors();
await normalizeCrimsonDesertGgShields();
await normalizeCrimsonDesertGgAbyssGear();
await normalizeCrimsonDesertGgMounts();
await normalizeCrimsonDesertGgBosses();
await normalizeCrimsonDesertGgQuests();
console.log(`Normalized ${weapons.length} crimsondesert.gg weapons into data/weapons.json`);
