export const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"] as const;

const rarityRank = new Map(RARITY_ORDER.map((rarity, index) => [rarity, index]));

export const compareRarity = (left: string, right: string) => {
  const leftRank = rarityRank.get(left) ?? Number.MAX_SAFE_INTEGER;
  const rightRank = rarityRank.get(right) ?? Number.MAX_SAFE_INTEGER;

  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  return left.localeCompare(right);
};

export const getOrderedRarityOptions = (rarities: string[]) =>
  [...new Set(rarities)].sort(compareRarity);

export const sortWeaponsByRarity = <T extends { rarity: string }>(
  weapons: T[],
  direction: "asc" | "desc" = "asc"
) =>
  [...weapons].sort((left, right) =>
    direction === "asc"
      ? compareRarity(left.rarity, right.rarity)
      : compareRarity(right.rarity, left.rarity)
  );
