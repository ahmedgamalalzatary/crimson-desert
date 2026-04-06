import { writeCategoryUrlManifest } from "../lib/category-pipeline";

export async function writeEmptyCrimsonDesertGgCategoryManifest(category: "armors" | "shields" | "abyss-gear") {
  return writeCategoryUrlManifest("crimsondesert-gg", category, []);
}
