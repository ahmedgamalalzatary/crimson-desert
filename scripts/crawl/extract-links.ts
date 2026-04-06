import * as cheerio from "cheerio";

export function extractUniqueLinks(html: string, baseUrl: string, hrefPattern: RegExp) {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");

    if (!href || !hrefPattern.test(href)) {
      return;
    }

    links.add(new URL(href, baseUrl).toString());
  });

  return [...links];
}
