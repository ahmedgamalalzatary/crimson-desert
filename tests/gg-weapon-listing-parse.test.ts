import { describe, expect, it } from "vitest";
import { parseWeaponListingText } from "../scripts/parse/crimsondesert-gg-weapon-listing";

describe("parseWeaponListingText", () => {
  it("parses repeated weapon listing blocks from rendered page text", () => {
    const text = `
CRIMSON DESERT FISTS

All 5 fists available in Crimson Desert. Each item includes base stats, full enhancement scaling, and where to find it.

Fists (5)
All Tiers
All Characters
Name
Muskan's Lower Body Clone
Fists
Damian
Attack
10
Muskan's Upper Body Clone
Fists
Damian
Attack
10
Ordinary Gloves
Fists
Kliff
Ordinary Gloves
Fists
Damian
Ordinary Gloves
Fists
Oongka
`;

    const parsed = parseWeaponListingText(text, {
      typeSlug: "one-hand-fist",
      baseUrl: "https://crimsondesert.gg"
    });

    expect(parsed.totalCount).toBe(5);
    expect(parsed.entries).toHaveLength(5);
    expect(parsed.entries[0]).toMatchObject({
      name: "Muskan's Lower Body Clone",
      typeLabel: "Fists",
      characters: "Damian",
      primaryStatLabel: "Attack",
      primaryStatValue: "10",
      href: "https://crimsondesert.gg/database/weapons/one-hand-fist/muskans-lower-body-clone"
    });
    expect(parsed.entries[4]).toMatchObject({
      name: "Ordinary Gloves",
      characters: "Oongka",
      href: "https://crimsondesert.gg/database/weapons/one-hand-fist/ordinary-gloves"
    });
  });
});
