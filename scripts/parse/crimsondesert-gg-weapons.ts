import { extractUniqueLinks } from "../crawl/extract-links";

export function extractCrimsonDesertGgWeaponTypeLinks(html: string) {
  return extractUniqueLinks(
    html,
    "https://crimsondesert.gg",
    /^\/database\/weapons\/[^/?#]+$/
  );
}

export function extractCrimsonDesertGgWeaponItemLinks(html: string) {
  return extractUniqueLinks(
    html,
    "https://crimsondesert.gg",
    /^\/database\/weapons\/[^/?#]+\/[^/?#]+$/
  );
}

export const extractCrimsonDesertGgWeaponLinks = extractCrimsonDesertGgWeaponTypeLinks;
