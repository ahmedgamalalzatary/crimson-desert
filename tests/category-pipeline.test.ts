import { describe, expect, it } from "vitest";
import {
  createCategoryUrlManifest,
  getCategoryDataPath,
  getCategoryGeneratedPath,
  getCategoryOverridePath
} from "../scripts/lib/category-pipeline";

describe("category pipeline helpers", () => {
  it("builds final and override data paths for a category", () => {
    expect(getCategoryDataPath("armors")).toBe("data/armors.json");
    expect(getCategoryOverridePath("quests-main")).toBe("data/overrides/quests-main.json");
  });

  it("builds generated data paths under the source bucket", () => {
    expect(getCategoryGeneratedPath("crimsondesert-gg", "shields", "count-summary")).toBe(
      "data/generated/crimsondesert-gg/shields-count-summary.json"
    );
  });

  it("creates a category url manifest with category metadata", () => {
    const manifest = createCategoryUrlManifest("crimsondesert-gg", "abyss-gear", [
      "https://crimsondesert.gg/database/abyss-gear/example"
    ]);

    expect(manifest.source).toBe("crimsondesert-gg");
    expect(manifest.category).toBe("abyss-gear");
    expect(manifest.urls).toHaveLength(1);
  });
});
