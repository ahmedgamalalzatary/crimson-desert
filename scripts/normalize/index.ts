import { normalizeCrimsonDesertGgWeapons } from "./crimsondesert-gg-weapons";

const weapons = await normalizeCrimsonDesertGgWeapons();
console.log(`Normalized ${weapons.length} crimsondesert.gg weapons into data/weapons.json`);
