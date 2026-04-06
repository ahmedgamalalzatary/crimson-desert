import type { categoryIds, sourceIds } from "./schema";

type SourceId = (typeof sourceIds)[number];
type CategoryId = (typeof categoryIds)[number];

interface SourceDefinition {
  id: SourceId;
  baseUrl: string;
  language: "en";
}

interface CategorySourceTarget {
  sourceId: SourceId;
  category: CategoryId;
  indexUrl: string;
}

interface RawHtmlPathInput {
  sourceId: SourceId;
  category: CategoryId;
  slug: string;
}

export const sourceCatalog: SourceDefinition[] = [
  {
    id: "crimsondesert-gg",
    baseUrl: "https://crimsondesert.gg",
    language: "en"
  },
  {
    id: "crimsondesert-th-gl",
    baseUrl: "https://crimsondesert.th.gl",
    language: "en"
  },
  {
    id: "game8",
    baseUrl: "https://game8.co/games/Crimson-Desert",
    language: "en"
  }
];

const categoryTargets: CategorySourceTarget[] = [
  {
    sourceId: "crimsondesert-gg",
    category: "weapons",
    indexUrl: "https://crimsondesert.gg/database/weapons"
  },
  {
    sourceId: "crimsondesert-th-gl",
    category: "weapons",
    indexUrl: "https://crimsondesert.th.gl/en"
  },
  {
    sourceId: "game8",
    category: "weapons",
    indexUrl: "https://game8.co/games/Crimson-Desert"
  }
];

export function getCategorySourceTargets(category: CategoryId) {
  return categoryTargets.filter((target) => target.category === category);
}

export function getRawHtmlPath(input: RawHtmlPathInput) {
  return `sources/${input.sourceId}/${input.category}/${input.slug}.html`;
}
