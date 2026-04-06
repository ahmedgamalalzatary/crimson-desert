import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { saveTextFile } from "../scripts/lib/raw-storage";

const tempDirs: string[] = [];

afterEach(async () => {
  const { rm } = await import("node:fs/promises");

  await Promise.all(tempDirs.map((path) => rm(path, { recursive: true, force: true })));
  tempDirs.length = 0;
});

describe("saveTextFile", () => {
  it("creates parent directories and writes content", async () => {
    const root = await mkdtemp(join(tmpdir(), "crimson-desert-"));
    const target = join(root, "sources", "crimsondesert-gg", "weapons", "index.html");

    tempDirs.push(root);

    await saveTextFile(target, "<html>ok</html>");

    await expect(readFile(target, "utf8")).resolves.toBe("<html>ok</html>");
  });
});
