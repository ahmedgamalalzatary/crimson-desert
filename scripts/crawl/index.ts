import { readFile, readdir } from "node:fs/promises";
import { crawlCrimsonDesertGgWeaponItems } from "./crimsondesert-gg-weapon-items";
import { runWeaponIndexCrawl } from "./run-weapon-index-crawl";
import { collectCrimsonDesertGgWeaponItemUrls } from "../parse/write-weapon-url-manifest";
import { crawlCrimsonDesertGgArmors } from "./crimsondesert-gg-armors";
import { crawlCrimsonDesertGgShields } from "./crimsondesert-gg-shields";
import { crawlCrimsonDesertGgAbyssGear } from "./crimsondesert-gg-abyss-gear";

await runWeaponIndexCrawl();
const ggSubtypeFiles = (await readdir("sources/crimsondesert-gg/weapons"))
  .filter((fileName) => fileName.endsWith(".html") && fileName !== "index.html");
const subtypePages = await Promise.all(
  ggSubtypeFiles.map((fileName) => readFile(`sources/crimsondesert-gg/weapons/${fileName}`, "utf8"))
);
const itemUrls = collectCrimsonDesertGgWeaponItemUrls(subtypePages);
const itemCount = await crawlCrimsonDesertGgWeaponItems(itemUrls);
await crawlCrimsonDesertGgArmors();
await crawlCrimsonDesertGgShields();
await crawlCrimsonDesertGgAbyssGear();

console.log(`Fetched raw weapon index pages and ${itemCount} crimsondesert.gg weapon item pages.`);
