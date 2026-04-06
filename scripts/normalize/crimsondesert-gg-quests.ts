import { readFile, readdir } from "node:fs/promises";
import { saveTextFile } from "../lib/raw-storage";
import { parseCrimsonDesertGgQuestDetail } from "../parse/crimsondesert-gg-quests";

async function normalize(category: "quests-main" | "quests-faction", folder: string, urlPrefix: string) {
  try { await readdir(folder); } catch { await saveTextFile(`data/${category}.json`, "[]"); return []; }
  const files = (await readdir(folder)).filter((name) => name.endsWith(".html"));
  const records = [];
  for (const file of files) {
    const html = await readFile(`${folder}/${file}`, "utf8");
    const url = `${urlPrefix}/${file.replace(/\.html$/, "")}`;
    records.push(parseCrimsonDesertGgQuestDetail(html, url, category));
  }
  records.sort((a,b)=>a.name.localeCompare(b.name));
  await saveTextFile(`data/${category}.json`, JSON.stringify(records, null, 2));
  return records;
}

export async function normalizeCrimsonDesertGgQuests() {
  const main = await normalize("quests-main", "sources/crimsondesert-gg/quests-main", "https://crimsondesert.gg/quests");
  const faction = await normalize("quests-faction", "sources/crimsondesert-gg/quests-faction", "https://crimsondesert.gg/faction-quests");
  return { main, faction };
}
