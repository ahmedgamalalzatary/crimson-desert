import { readFile, readdir } from "node:fs/promises";
import { saveTextFile } from "../lib/raw-storage";
import { parseCrimsonDesertGgArmorDetail } from "../parse/crimsondesert-gg-armors";

export async function normalizeCrimsonDesertGgArmors() {
  try {
    await readdir("sources/crimsondesert-gg/armors");
  } catch {
    await saveTextFile("data/armors.json", JSON.stringify([], null, 2));
    return [];
  }

  const files = (await readdir("sources/crimsondesert-gg/armors")).filter((name) => name.endsWith(".html"));
  const records = [];
  for (const file of files) {
    const html = await readFile(`sources/crimsondesert-gg/armors/${file}`, "utf8");
    const url = `https://crimsondesert.gg/database/armor/${file.replace(/\.html$/, "")}`;
    records.push(parseCrimsonDesertGgArmorDetail(html, url));
  }
  records.sort((a, b) => a.name.localeCompare(b.name));
  await saveTextFile("data/armors.json", JSON.stringify(records, null, 2));
  return records;
}
