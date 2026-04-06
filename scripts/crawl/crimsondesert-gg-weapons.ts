import { chromium } from "playwright";
import { saveTextFile } from "../lib/raw-storage";
import { extractCrimsonDesertGgWeaponTypeLinks } from "../parse/crimsondesert-gg-weapons";

function getTypeSlug(url: string) {
  const segments = new URL(url).pathname.split("/").filter(Boolean);

  return segments.at(-1) ?? "unknown";
}

export function getCrimsonDesertGgWeaponPagePath(typeSlug: string, pageNumber: number) {
  if (pageNumber <= 1) {
    return `sources/crimsondesert-gg/weapons/${typeSlug}.html`;
  }

  return `sources/crimsondesert-gg/weapons/${typeSlug}.page-${pageNumber}.html`;
}

export function extractCrimsonDesertGgWeaponPageCount(html: string) {
  const match = html.match(/Page\s+\d+\s+of\s+(\d+)/i);

  return match ? Number(match[1]) : 1;
}

export async function crawlCrimsonDesertGgWeaponPages(indexHtml: string) {
  const typeUrls = extractCrimsonDesertGgWeaponTypeLinks(indexHtml);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2200 } });

  try {
    for (const typeUrl of typeUrls) {
      await page.goto(typeUrl, { waitUntil: "networkidle" });

      const typeSlug = getTypeSlug(typeUrl);
      let pageNumber = 1;

      while (true) {
        const html = await page.content();
        await saveTextFile(getCrimsonDesertGgWeaponPagePath(typeSlug, pageNumber), html);

        const nextButton = page.locator("button.db-page-btn", { hasText: "Next" });

        if ((await nextButton.count()) === 0 || (await nextButton.isDisabled())) {
          break;
        }

        pageNumber += 1;
        await nextButton.click();
        await page.waitForLoadState("networkidle");
      }
    }
  } finally {
    await browser.close();
  }

  return typeUrls;
}
