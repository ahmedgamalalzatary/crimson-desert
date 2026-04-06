export function extractCrimsonDesertGgShieldLinks(html: string) {
  const matches = [...html.matchAll(/href="(https:\/\/crimsondesert\.gg\/database\/shields\/[^"]+)"/g)];
  return [...new Set(matches.map((match) => match[1]))];
}
