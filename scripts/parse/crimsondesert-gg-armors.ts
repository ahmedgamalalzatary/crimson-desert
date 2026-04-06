export function extractCrimsonDesertGgArmorLinks(html: string) {
  const matches = [...html.matchAll(/href="(https:\/\/crimsondesert\.gg\/database\/armor\/[^"]+)"/g)];
  return [...new Set(matches.map((match) => match[1]))];
}
