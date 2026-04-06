import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import { saveTextFile } from "../lib/raw-storage";

interface WeaponTypeManifest {
  typeUrls: string[];
  itemUrls: string[];
}

interface WeaponManifestFile {
  generatedAt: string;
  sources: {
    "crimsondesert-gg": WeaponTypeManifest;
    "crimsondesert-th-gl": string[];
    game8: string[];
  };
}

async function extractPagedWeaponCards(page: import("playwright").Page) {
  const entries = [];

  while (true) {
    const pageEntries = await page.locator("a.db-item-card").evaluateAll((nodes) =>
      nodes.map((node, index) => ({
        pageEntryIndex: index + 1,
        href: (node as HTMLAnchorElement).href,
        name: node.querySelector(".db-item-card-name")?.textContent?.trim() ?? "",
        typeLabel: node.querySelector(".db-item-card-type")?.textContent?.trim() ?? "",
        characters: node.querySelector(".db-item-card-chars")?.textContent?.trim() ?? "",
        primaryStatLabel: node.querySelector(".db-stat-label-small")?.textContent?.trim() ?? null,
        primaryStatValue: node.querySelector(".db-stat-value-small")?.textContent?.trim() ?? null
      }))
    );

    entries.push(...pageEntries);

    const nextButton = page.locator("button.db-page-btn", { hasText: "Next" });

    if ((await nextButton.count()) === 0) {
      break;
    }

    if (await nextButton.isDisabled()) {
      break;
    }

    await nextButton.click();
    await page.waitForLoadState("networkidle");
  }

  return entries;
}

export async function exportCrimsonDesertGgWeapons() {
  const manifest = JSON.parse(
    await readFile("data/generated/weapons-url-manifest.json", "utf8")
  ) as WeaponManifestFile;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2200 } });
  const listings = [];

  for (const typeUrl of manifest.sources["crimsondesert-gg"].typeUrls) {
    await page.goto(typeUrl, { waitUntil: "networkidle" });
    const bodyText = await page.locator("body").innerText();
    const totalCount = Number(bodyText.match(/^All (\d+) /im)?.[1] ?? 0);
    const entries = await extractPagedWeaponCards(page);
    const listing = {
      totalCount,
      entries
    };

    listings.push({
      typeUrl,
      ...listing
    });
  }

  await browser.close();

  const renderedEntries = listings.flatMap((listing) =>
    listing.entries.map((entry, index) => ({
      entryId: `${entry.href}#${index + 1}`,
      source: "crimsondesert-gg",
      ...entry
    }))
  );

  const uniqueDetailItems = manifest.sources["crimsondesert-gg"].itemUrls.map((url) => {
    const segments = new URL(url).pathname.split("/").filter(Boolean);

    return {
      source: "crimsondesert-gg",
      url,
      typeSlug: segments.at(-2) ?? "",
      itemSlug: segments.at(-1) ?? ""
    };
  });

  const summary = {
    verifiedAt: new Date().toISOString(),
    source: "crimsondesert-gg",
    renderedListingEntryCount: renderedEntries.length,
    renderedListingCountFromTypePages: listings.reduce(
      (sum, listing) => sum + listing.totalCount,
      0
    ),
    uniqueDetailPageCount: uniqueDetailItems.length
  };

  await saveTextFile(
    "data/generated/crimsondesert-gg/weapons-rendered-listings.json",
    JSON.stringify(renderedEntries, null, 2)
  );
  await saveTextFile(
    "data/generated/crimsondesert-gg/weapons-type-breakdown.json",
    JSON.stringify(listings, null, 2)
  );
  await saveTextFile(
    "data/generated/crimsondesert-gg/weapons-unique-detail-pages.json",
    JSON.stringify(uniqueDetailItems, null, 2)
  );
  await saveTextFile(
    "data/generated/crimsondesert-gg/weapons-count-summary.json",
    JSON.stringify(summary, null, 2)
  );

  return summary;
}
