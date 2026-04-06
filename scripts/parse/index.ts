import { writeWeaponUrlManifest } from "./write-weapon-url-manifest";

const manifest = await writeWeaponUrlManifest();
console.log(
  `Generated weapon URL manifest. crimsondesert.gg types: ${manifest.sources["crimsondesert-gg"].typeUrls.length}, items: ${manifest.sources["crimsondesert-gg"].itemUrls.length}`
);
