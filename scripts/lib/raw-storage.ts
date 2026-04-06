import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function saveTextFile(filePath: string, content: string) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}
