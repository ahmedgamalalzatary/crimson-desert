import { writeWeaponUrlManifest } from "./write-weapon-url-manifest";
import { writeEmptyCrimsonDesertGgCategoryManifest } from "./crimsondesert-gg-category-manifest";

const manifest = await writeWeaponUrlManifest();
await writeEmptyCrimsonDesertGgCategoryManifest("armors");
await writeEmptyCrimsonDesertGgCategoryManifest("shields");
await writeEmptyCrimsonDesertGgCategoryManifest("abyss-gear");
console.log(
  `Generated weapon URL manifest. crimsondesert.gg types: ${manifest.sources["crimsondesert-gg"].typeUrls.length}, items: ${manifest.sources["crimsondesert-gg"].itemUrls.length}`
);
