import { normalizeCrimsonDesertGgWeapons } from "./crimsondesert-gg-weapons";
import { normalizeCrimsonDesertGgArmors } from "./crimsondesert-gg-armors";
import { normalizeCrimsonDesertGgShields } from "./crimsondesert-gg-shields";
import { normalizeCrimsonDesertGgAbyssGear } from "./crimsondesert-gg-abyss-gear";

const weapons = await normalizeCrimsonDesertGgWeapons();
await normalizeCrimsonDesertGgArmors();
await normalizeCrimsonDesertGgShields();
await normalizeCrimsonDesertGgAbyssGear();
console.log(`Normalized ${weapons.length} crimsondesert.gg weapons into data/weapons.json`);
