import { readFile, readdir } from "node:fs/promises";
import { saveTextFile } from "../lib/raw-storage";
import { parseCrimsonDesertGgAbyssGearDetail } from "../parse/crimsondesert-gg-abyss-gear";

export async function normalizeCrimsonDesertGgAbyssGear() {
  try { await readdir("sources/crimsondesert-gg/abyss-gear"); } catch { await saveTextFile("data/abyss-gear.json", "[]"); return []; }
  const files = (await readdir("sources/crimsondesert-gg/abyss-gear")).filter((name) => name.endsWith(".html"));
  const records = [];
  for (const file of files) {
    const html = await readFile(`sources/crimsondesert-gg/abyss-gear/${file}`, "utf8");
    const url = `https://crimsondesert.gg/database/abyss-gear/${file.replace(/\.html$/, "")}`;
    records.push(parseCrimsonDesertGgAbyssGearDetail(html, url));
  }
  records.sort((a,b)=>a.name.localeCompare(b.name));
  await saveTextFile("data/abyss-gear.json", JSON.stringify(records, null, 2));
  return records;
}
