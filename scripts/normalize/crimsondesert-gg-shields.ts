import { readFile, readdir } from "node:fs/promises";
import { saveTextFile } from "../lib/raw-storage";
import { parseCrimsonDesertGgShieldDetail } from "../parse/crimsondesert-gg-shields";

export async function normalizeCrimsonDesertGgShields() {
  try {
    await readdir("sources/crimsondesert-gg/shields");
  } catch {
    await saveTextFile("data/shields.json", JSON.stringify([], null, 2));
    return [];
  }

  const files = (await readdir("sources/crimsondesert-gg/shields")).filter((name) => name.endsWith(".html"));
  const records = [];
  for (const file of files) {
    const html = await readFile(`sources/crimsondesert-gg/shields/${file}`, "utf8");
    const url = `https://crimsondesert.gg/database/shields/${file.replace(/\.html$/, "")}`;
    records.push(parseCrimsonDesertGgShieldDetail(html, url));
  }
  records.sort((a, b) => a.name.localeCompare(b.name));
  await saveTextFile("data/shields.json", JSON.stringify(records, null, 2));
  return records;
}
