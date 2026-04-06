import { readFile, readdir } from "node:fs/promises";
import { saveTextFile } from "../lib/raw-storage";
import {
  extractCrimsonDesertGgWeaponItemLinks,
  extractCrimsonDesertGgWeaponLinks
} from "./crimsondesert-gg-weapons";

interface WeaponUrlManifest {
  generatedAt: string;
  sources: {
    "crimsondesert-gg": {
      typeUrls: string[];
      itemUrls: string[];
    };
    "crimsondesert-th-gl": string[];
    game8: string[];
  };
}

export function collectCrimsonDesertGgWeaponItemUrls(htmlPages: string[]) {
  return [...new Set(htmlPages.flatMap((html) => extractCrimsonDesertGgWeaponItemLinks(html)))];
}

export async function writeWeaponUrlManifest() {
  const ggIndexHtml = await readFile("sources/crimsondesert-gg/weapons/index.html", "utf8");
  const ggSubtypeFiles = (await readdir("sources/crimsondesert-gg/weapons"))
    .filter((fileName) => fileName.endsWith(".html") && fileName !== "index.html");
  const ggSubtypePages = await Promise.all(
    ggSubtypeFiles.map((fileName) => readFile(`sources/crimsondesert-gg/weapons/${fileName}`, "utf8"))
  );
  const manifest: WeaponUrlManifest = {
    generatedAt: new Date().toISOString(),
    sources: {
      "crimsondesert-gg": {
        typeUrls: extractCrimsonDesertGgWeaponLinks(ggIndexHtml),
        itemUrls: collectCrimsonDesertGgWeaponItemUrls(ggSubtypePages)
      },
      "crimsondesert-th-gl": [],
      game8: []
    }
  };

  await saveTextFile("data/generated/weapons-url-manifest.json", JSON.stringify(manifest, null, 2));

  return manifest;
}
