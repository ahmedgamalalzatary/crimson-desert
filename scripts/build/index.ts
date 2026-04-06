import { exportCrimsonDesertGgWeapons } from "./export-crimsondesert-gg-weapons";

const summary = await exportCrimsonDesertGgWeapons();
console.log(
  `Generated crimsondesert.gg weapon JSON. Rendered entries: ${summary.renderedListingEntryCount}, unique detail pages: ${summary.uniqueDetailPageCount}`
);
