import { describe, expect, it } from "vitest";
import {
  getCategorySourceTargets,
  getRawHtmlPath,
  sourceCatalog
} from "../scripts/lib/sources";

describe("source catalog", () => {
  it("includes the three agreed source sites", () => {
    expect(sourceCatalog.map((source) => source.id)).toEqual([
      "crimsondesert-gg",
      "crimsondesert-th-gl",
      "game8"
    ]);
  });

  it("defines weapon targets for the current first slice", () => {
    const targets = getCategorySourceTargets("weapons");

    expect(targets).toHaveLength(3);
    expect(targets.every((target) => target.category === "weapons")).toBe(true);
  });
});

describe("raw source paths", () => {
  it("builds a deterministic html storage path", () => {
    const path = getRawHtmlPath({
      sourceId: "crimsondesert-gg",
      category: "weapons",
      slug: "ashen-blade"
    });

    expect(path).toBe("sources/crimsondesert-gg/weapons/ashen-blade.html");
  });
});
