import { chromium } from "playwright";
import { saveTextFile } from "../lib/raw-storage";
import { extractUniqueLinks } from "./extract-links";

interface CategoryCrawlConfig {
  category: "armors" | "shields" | "abyss-gear";
  indexUrl: string;
  listingFileStem: string;
}

export function extractCrimsonDesertGgCategoryPageCount(html: string) {
  const match = html.match(/Page\s+\d+\s+of\s+(\d+)/i);
  return match ? Number(match[1]) : 1;
}

export function collectCrimsonDesertGgCategoryItemUrls(
  htmlPages: string[],
  baseUrl: string,
  hrefPattern: RegExp
) {
  return [...new Set(htmlPages.flatMap((html) => extractUniqueLinks(html, baseUrl, hrefPattern)))];
}

function getListingPath(category: CategoryCrawlConfig["category"], listingFileStem: string, pageNumber: number) {
  const suffix = pageNumber <= 1 ? "" : `.page-${pageNumber}`;
  return `sources/crimsondesert-gg/${category}/listings/${listingFileStem}${suffix}.html`;
}

export async function crawlCrimsonDesertGgCategoryPages(config: CategoryCrawlConfig) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2200 } });
  const htmlPages: string[] = [];

  try {
    await page.goto(config.indexUrl, { waitUntil: "networkidle" });
    const totalPages = extractCrimsonDesertGgCategoryPageCount(await page.content());

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      if (pageNumber > 1) {
        const nextButton = page.locator("button.db-page-btn", { hasText: "Next" });
        if ((await nextButton.count()) === 0 || (await nextButton.isDisabled())) {
          break;
        }

        await nextButton.click();
        await page.waitForLoadState("networkidle");
      }

      const html = await page.content();
      htmlPages.push(html);
      await saveTextFile(getListingPath(config.category, config.listingFileStem, pageNumber), html);
    }
  } finally {
    await browser.close();
  }

  return collectCrimsonDesertGgCategoryItemUrls(
    htmlPages,
    "https://crimsondesert.gg",
    config.category === "abyss-gear"
      ? /^\/database\/abyss-gear\/[^/?#]+$/
      : /^\/database\/(?:armor|shields)\/[^/?#]+\/[^/?#]+$/
  );
}
