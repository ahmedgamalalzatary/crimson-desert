import { saveTextFile } from "../lib/raw-storage";
import { fetchHtml } from "./fetch-html";
import { extractCrimsonDesertGgFactionQuestLinks, extractCrimsonDesertGgQuestLinks } from "../parse/crimsondesert-gg-quests";

export async function crawlCrimsonDesertGgQuests() {
  const mainHtml = await fetchHtml("https://crimsondesert.gg/quests");
  const factionHtml = await fetchHtml("https://crimsondesert.gg/faction-quests");
  const mainUrls = new Set(extractCrimsonDesertGgQuestLinks(mainHtml));
  const factionUrls = new Set(extractCrimsonDesertGgFactionQuestLinks(factionHtml));

  await saveTextFile("data/generated/crimsondesert-gg/quests-main-url-manifest.json", JSON.stringify({ generatedAt: new Date().toISOString(), source: "crimsondesert-gg", category: "quests-main", urls: [...mainUrls] }, null, 2));
  await saveTextFile("data/generated/crimsondesert-gg/quests-faction-url-manifest.json", JSON.stringify({ generatedAt: new Date().toISOString(), source: "crimsondesert-gg", category: "quests-faction", urls: [...factionUrls] }, null, 2));

  for (const url of mainUrls) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "unknown";
    await saveTextFile(`sources/crimsondesert-gg/quests-main/${slug}.html`, await fetchHtml(url));
  }
  for (const url of factionUrls) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "unknown";
    await saveTextFile(`sources/crimsondesert-gg/quests-faction/${slug}.html`, await fetchHtml(url));
  }
  return { main: [...mainUrls], faction: [...factionUrls] };
}
