import { mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { saveTextFile } from "./raw-storage";
import type { categoryIds, sourceIds } from "./schema";

type SourceId = (typeof sourceIds)[number];
type CategoryId = (typeof categoryIds)[number];

export interface CategoryUrlManifest<TItem = string> {
  generatedAt: string;
  source: SourceId;
  category: CategoryId;
  urls: TItem[];
}

export function getCategoryDataPath(category: CategoryId) {
  return `data/${category}.json`;
}

export function getCategoryOverridePath(category: CategoryId) {
  return `data/overrides/${category}.json`;
}

export function getCategoryGeneratedPath(sourceId: SourceId, category: CategoryId, name: string) {
  return `data/generated/${sourceId}/${category}-${name}.json`;
}

export function createCategoryUrlManifest<TItem = string>(
  source: SourceId,
  category: CategoryId,
  urls: TItem[]
): CategoryUrlManifest<TItem> {
  return {
    generatedAt: new Date().toISOString(),
    source,
    category,
    urls
  };
}

export async function writeCategoryUrlManifest<TItem = string>(
  source: SourceId,
  category: CategoryId,
  urls: TItem[]
) {
  const manifest = createCategoryUrlManifest(source, category, urls);
  await saveTextFile(
    `data/generated/${source}/${category}-url-manifest.json`,
    JSON.stringify(manifest, null, 2)
  );
  return manifest;
}

export async function readCategoryJson<T>(category: CategoryId) {
  return JSON.parse(await readFile(getCategoryDataPath(category), "utf8")) as T;
}

export async function ensureCategoryDirectories(category: CategoryId, source: SourceId) {
  await mkdir(dirname(`data/generated/${source}/${category}-placeholder.json`), {
    recursive: true
  });
}
