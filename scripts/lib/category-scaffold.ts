import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { saveTextFile } from "./raw-storage";
import {
  createCategoryUrlManifest,
  getCategoryDataPath,
  getCategoryGeneratedPath
} from "./category-pipeline";
import type { categoryIds, sourceIds } from "./schema";

type SourceId = (typeof sourceIds)[number];
type CategoryId = (typeof categoryIds)[number];

export async function writeEmptyCategoryOutputs(source: SourceId, category: CategoryId) {
  const manifest = createCategoryUrlManifest(source, category, []);
  const emptyList: unknown[] = [];

  await saveTextFile(
    `data/generated/${source}/${category}-url-manifest.json`,
    JSON.stringify(manifest, null, 2)
  );
  await saveTextFile(
    getCategoryGeneratedPath(source, category, "rendered-listings"),
    JSON.stringify(emptyList, null, 2)
  );
  await saveTextFile(
    getCategoryGeneratedPath(source, category, "type-breakdown"),
    JSON.stringify(emptyList, null, 2)
  );
  await saveTextFile(
    getCategoryGeneratedPath(source, category, "unique-detail-pages"),
    JSON.stringify(emptyList, null, 2)
  );
  await saveTextFile(
    getCategoryGeneratedPath(source, category, "count-summary"),
    JSON.stringify(
      {
        verifiedAt: new Date().toISOString(),
        source,
        category,
        renderedListingEntryCount: 0,
        renderedListingCountFromTypePages: 0,
        uniqueDetailPageCount: 0
      },
      null,
      2
    )
  );
  await saveTextFile(getCategoryDataPath(category), JSON.stringify(emptyList, null, 2));

  return manifest;
}

export async function readCategoryOutput<T>(category: CategoryId) {
  const filePath = getCategoryDataPath(category);

  try {
    await access(filePath, constants.F_OK);
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return [] as T;
  }
}
