import { exportCrimsonDesertGgWeapons } from "./export-crimsondesert-gg-weapons";
import { exportCrimsonDesertGgArmors } from "./export-crimsondesert-gg-armors";
import { exportCrimsonDesertGgShields } from "./export-crimsondesert-gg-shields";
import { exportCrimsonDesertGgAbyssGear } from "./export-crimsondesert-gg-abyss-gear";

const summary = await exportCrimsonDesertGgWeapons();
await exportCrimsonDesertGgArmors();
await exportCrimsonDesertGgShields();
await exportCrimsonDesertGgAbyssGear();
console.log(
  `Generated crimsondesert.gg weapon JSON. Rendered entries: ${summary.renderedListingEntryCount}, unique detail pages: ${summary.uniqueDetailPageCount}`
);
