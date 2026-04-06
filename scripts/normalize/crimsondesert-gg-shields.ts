import { readFile, readdir } from "node:fs/promises";
import { load } from "cheerio";
import { saveTextFile } from "../lib/raw-storage";

function parseShield(html: string, url: string) {
  const $ = load(html);
  const name = $(".db-item-name").first().text().trim() || $("h1").first().text().trim();
  const typeLabel = $(".db-item-type").first().text().trim();
  const rarity = $(".db-item-tier").first().text().trim().toLowerCase();
  const description = $(".db-item-desc").first().text().trim();
  return {
    id: url.split("/").filter(Boolean).at(-1) ?? name.toLowerCase().replace(/\s+/g, "-"),
    name,
    slug: url.split("/").filter(Boolean).at(-1) ?? name.toLowerCase().replace(/\s+/g, "-"),
    category: "shields" as const,
    type: typeLabel,
    typeLabel,
    rarity,
    description,
    source: { site: "crimsondesert.gg" as const, url }
  };
}

export async function normalizeCrimsonDesertGgShields() {
  const files = await readdir("sources/crimsondesert-gg/shields");
  const shields = [];
  for (const file of files.filter((name) => name.endsWith(".html"))) {
    const html = await readFile(`sources/crimsondesert-gg/shields/${file}`, "utf8");
    const url = `https://crimsondesert.gg/database/shields/${file.replace(/\.html$/, "")}`;
    shields.push(parseShield(html, url));
  }
  await saveTextFile("data/shields.json", JSON.stringify(shields, null, 2));
  return shields;
}
