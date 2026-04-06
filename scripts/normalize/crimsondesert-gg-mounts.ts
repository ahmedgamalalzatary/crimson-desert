import { readFile, readdir } from "node:fs/promises";
import { saveTextFile } from "../lib/raw-storage";
import { parseCrimsonDesertGgMountDetail } from "../parse/crimsondesert-gg-mounts";

export async function normalizeCrimsonDesertGgMounts() {
  try { await readdir("sources/crimsondesert-gg/mounts"); } catch { await saveTextFile("data/mounts.json", "[]"); return []; }
  const files = (await readdir("sources/crimsondesert-gg/mounts")).filter((name) => name.endsWith(".html"));
  const records = [];
  for (const file of files) {
    const html = await readFile(`sources/crimsondesert-gg/mounts/${file}`, "utf8");
    const url = `https://crimsondesert.gg/mounts/${file.replace(/\.html$/, "")}`;
    records.push(parseCrimsonDesertGgMountDetail(html, url));
  }
  records.sort((a,b)=>a.name.localeCompare(b.name));
  await saveTextFile("data/mounts.json", JSON.stringify(records, null, 2));
  return records;
}
