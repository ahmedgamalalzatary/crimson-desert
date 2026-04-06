import { readFile, readdir } from "node:fs/promises";
import { saveTextFile } from "../lib/raw-storage";
import { parseCrimsonDesertGgBossDetail } from "../parse/crimsondesert-gg-bosses";

export async function normalizeCrimsonDesertGgBosses() {
  try { await readdir("sources/crimsondesert-gg/bosses"); } catch { await saveTextFile("data/bosses.json", "[]"); return []; }
  const files = (await readdir("sources/crimsondesert-gg/bosses")).filter((name) => name.endsWith(".html"));
  const records = [];
  for (const file of files) {
    const html = await readFile(`sources/crimsondesert-gg/bosses/${file}`, "utf8");
    const url = `https://crimsondesert.gg/bosses/${file.replace(/\.html$/, "")}`;
    records.push(parseCrimsonDesertGgBossDetail(html, url));
  }
  records.sort((a,b)=>a.name.localeCompare(b.name));
  await saveTextFile("data/bosses.json", JSON.stringify(records, null, 2));
  return records;
}
