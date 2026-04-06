import type { WeaponListItem } from "./weapons";
import { getOrderedRarityOptions } from "./rarity";

const compareText = (left: string, right: string) => left.localeCompare(right);
const compareNumber = (left: number, right: number) => left - right;

function compareRarity(left: string, right: string): number {
  const order = getOrderedRarityOptions([left, right]);
  return order.indexOf(left) - order.indexOf(right);
}

function initWeaponDirectory(root: HTMLElement) {
  const dataNode = document.getElementById("weapon-directory-data");

  if (!dataNode?.textContent) return;

  const weapons: WeaponListItem[] = JSON.parse(dataNode.textContent);
  const searchInput = root.querySelector("[data-search]");
  const sortInputs = [...root.querySelectorAll("[data-sort-option]")];
  const sortLabel = root.querySelector("[data-sort-label]");
  const rarityInputs = [...root.querySelectorAll("[data-rarity]")];
  const typeInputs = [...root.querySelectorAll("[data-type]")];
  const characterInputs = [...root.querySelectorAll("[data-character]")];
  const results = root.querySelector("[data-results]");
  const countNode = root.querySelector("[data-count]");
  const rarityCountNodes = [...root.querySelectorAll('[data-filter-count="rarity"]')];
  const typeCountNodes = [...root.querySelectorAll('[data-filter-count="type"]')];
  const characterCountNodes = [...root.querySelectorAll('[data-filter-count="character"]')];

  const getFilterCounts = ({
    query,
    selectedRarities,
    selectedTypes,
    selectedCharacters
  }: {
    query: string;
    selectedRarities: string[];
    selectedTypes: string[];
    selectedCharacters: string[];
  }) => {
    const normalizedQuery = query.trim().toLowerCase();
    const queryMatches = weapons.filter((weapon) => {
      if (normalizedQuery.length === 0) {
        return true;
      }

      return (
        weapon.name.toLowerCase().includes(normalizedQuery) ||
        weapon.type.toLowerCase().includes(normalizedQuery) ||
        (weapon.character?.toLowerCase().includes(normalizedQuery) ?? false)
      );
    });
    const rarityPool = queryMatches.filter(
      (weapon) =>
        selectedTypes.length === 0 || selectedTypes.includes(weapon.type)
    );
    const typePool = queryMatches.filter(
      (weapon) =>
        selectedRarities.length === 0 || selectedRarities.includes(weapon.rarity)
    );
    const characterPool = queryMatches.filter(
      (weapon) =>
        selectedCharacters.length === 0 ||
        selectedCharacters.includes(weapon.character ?? "")
    );

    return {
      total: queryMatches.filter(
        (weapon) =>
          (selectedRarities.length === 0 || selectedRarities.includes(weapon.rarity)) &&
        (selectedTypes.length === 0 || selectedTypes.includes(weapon.type))
        && (selectedCharacters.length === 0 ||
          selectedCharacters.includes(weapon.character ?? ""))
      ).length,
      rarityCounts: Object.fromEntries(
        rarityPool.map((weapon) => weapon.rarity).map((rarity, _, all) => [
          rarity,
          rarityPool.filter((weapon) => weapon.rarity === rarity).length
        ]).filter(
          ([rarity], index, all) =>
            all.findIndex(([value]) => value === rarity) === index
        )
      ),
    typeCounts: Object.fromEntries(
      typePool.map((weapon) => weapon.type).map((type, _, all) => [
        type,
        typePool.filter((weapon) => weapon.type === type).length
      ]).filter(
        ([type], index, all) =>
          all.findIndex(([value]) => value === type) === index
      )
    )
      ,
    characterCounts: Object.fromEntries(
      characterPool.map((weapon) => weapon.character ?? "").map((character, _, all) => [
        character,
        characterPool.filter((weapon) => (weapon.character ?? "") === character).length
      ]).filter(
        ([character], index, all) =>
          all.findIndex(([value]) => value === character) === index
      )
    )
  };
  };

  const getSelectedValues = (inputs: Element[]) =>
    inputs.filter((input) => (input as HTMLInputElement).checked).map((input) => (input as HTMLInputElement).value);

  const renderCard = (weapon: WeaponListItem) => `
    <article class="wd-card">
      <div class="wd-card__top">
        <div>
          <p class="wd-card__type">${weapon.typeLabel}</p>
          <a href="/weapon/${weapon.slug}" class="wd-card__name">${weapon.name}</a>
        </div>
        <span class="wd-card__rarity">${weapon.rarity}</span>
      </div>
      <div class="wd-card__stats-group">
        <div class="wd-card__stats-row">
          <div class="wd-card__stat wd-card__stat--full">
            <div class="wd-card__stat-label">Type</div>
            <div class="wd-card__stat-value wd-card__stat-value--text">${weapon.type}</div>
          </div>
        </div>
        <div class="wd-card__stats-row">
          <div class="wd-card__stat">
            <div class="wd-card__stat-label">Base</div>
            <div class="wd-card__stat-value">${weapon.stats.baseDamage ?? "—"}</div>
          </div>
          <div class="wd-card__stat">
            <div class="wd-card__stat-label">Final</div>
            <div class="wd-card__stat-value wd-card__stat-value--accent">${weapon.stats.finalDamage ?? "—"}</div>
          </div>
        </div>
      </div>
      <a href="/weapon/${weapon.slug}" class="wd-card__link">
        View details
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </a>
    </article>`;

  const render = () => {
    const query = searchInput instanceof HTMLInputElement ? searchInput.value.trim().toLowerCase() : "";
    const selectedRarities = getSelectedValues(rarityInputs);
    const selectedTypes = getSelectedValues(typeInputs);
    const selectedCharacters = getSelectedValues(characterInputs);
    const sortValue = sortInputs.find((i) => (i as HTMLInputElement).checked)
      ? (sortInputs.find((i) => (i as HTMLInputElement).checked) as HTMLInputElement).value
      : "name-asc";
    const filterCounts = getFilterCounts({
      query,
      selectedRarities,
      selectedTypes,
      selectedCharacters
    });

    const filtered = weapons.filter((weapon) => {
      const matchesQuery =
        query.length === 0 ||
        weapon.name.toLowerCase().includes(query) ||
        weapon.type.toLowerCase().includes(query);
      const matchesRarity =
        selectedRarities.length === 0 || selectedRarities.includes(weapon.rarity);
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(weapon.type);
      const matchesCharacter =
        selectedCharacters.length === 0 ||
        selectedCharacters.includes(weapon.character ?? "");

      return matchesQuery && matchesRarity && matchesType && matchesCharacter;
    });

    filtered.sort((left, right) => {
      switch (sortValue) {
        case "name-desc":
          return compareText(right.name, left.name);
        case "baseDamage-desc":
          return compareNumber((right.stats.baseDamage ?? -1), (left.stats.baseDamage ?? -1));
        case "baseDamage-asc":
          return compareNumber((left.stats.baseDamage ?? -1), (right.stats.baseDamage ?? -1));
        case "finalDamage-desc":
          return compareNumber((right.stats.finalDamage ?? -1), (left.stats.finalDamage ?? -1));
        case "finalDamage-asc":
          return compareNumber((left.stats.finalDamage ?? -1), (right.stats.finalDamage ?? -1));
        case "rarity-asc":
          return compareRarity(left.rarity, right.rarity);
        case "rarity-desc":
          return compareRarity(right.rarity, left.rarity);
        case "character-asc":
          return compareText(left.character ?? "", right.character ?? "");
        case "character-desc":
          return compareText(right.character ?? "", left.character ?? "");
        default:
          return compareText(left.name, right.name);
      }
    });

    if (countNode) {
      countNode.textContent = String(filterCounts.total);
    }

    rarityCountNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const value = node.dataset.filterValue ?? "";
      node.textContent = String(filterCounts.rarityCounts[value] ?? 0);
    });

    typeCountNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const value = node.dataset.filterValue ?? "";
      node.textContent = String(filterCounts.typeCounts[value] ?? 0);
    });
    characterCountNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const value = node.dataset.filterValue ?? "";
      node.textContent = String(filterCounts.characterCounts[value] ?? 0);
    });

    if (results instanceof HTMLElement) {
      results.innerHTML = filtered.map((weapon) => renderCard(weapon)).join("");
    }
  };

  searchInput?.addEventListener("input", render);
  rarityInputs.forEach((input) => input.addEventListener("change", render));
  typeInputs.forEach((input) => input.addEventListener("change", render));
  characterInputs.forEach((input) => input.addEventListener("change", render));

  function updateBadge(badge: Element | null, count: number) {
    if (!badge) return;
    if (count > 0) {
      badge.textContent = String(count);
      badge.classList.add("wd-dropdown__badge--visible");
    } else {
      badge.classList.remove("wd-dropdown__badge--visible");
    }
  }

  root.querySelectorAll("[data-filter-group-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const group = (btn as HTMLElement).closest(".wd-filter-group");
      if (group) group.classList.toggle("wd-filter-group--open");
    });
  });

  const filtersBadge = root.querySelector('[data-dropdown-count="filters"]');
  const rarityBadge = root.querySelector('[data-dropdown-count="rarity"]');
  const typeBadge = root.querySelector('[data-dropdown-count="type"]');

  function updateFilterBadges() {
    const rarityCount = rarityInputs.filter((i) => (i as HTMLInputElement).checked).length;
    const typeCount = typeInputs.filter((i) => (i as HTMLInputElement).checked).length;
    const characterCount = characterInputs.filter((i) => (i as HTMLInputElement).checked).length;
    updateBadge(rarityBadge, rarityCount);
    updateBadge(typeBadge, typeCount);
    updateBadge(root.querySelector('[data-dropdown-count="character"]'), characterCount);
    updateBadge(filtersBadge, rarityCount + typeCount + characterCount);
  }

  rarityInputs.forEach((input) => input.addEventListener("change", updateFilterBadges));
  typeInputs.forEach((input) => input.addEventListener("change", updateFilterBadges));
  characterInputs.forEach((input) => input.addEventListener("change", updateFilterBadges));

  function setupDropdown(name: string, inputs: Element[], labelSelector?: string) {
    const btn = root.querySelector(`[data-dropdown-btn="${name}"]`);
    const panel = root.querySelector(`[data-dropdown-panel="${name}"]`);
    if (!btn || !panel) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      root.querySelectorAll("[data-dropdown-panel]").forEach((p) => {
        if (p !== panel) p.classList.remove("wd-dropdown__panel--open");
      });
      panel.classList.toggle("wd-dropdown__panel--open");
    });

    panel.addEventListener("click", (e) => e.stopPropagation());

    if (labelSelector) {
      inputs.forEach((input) => {
        input.addEventListener("change", () => {
          const selected = inputs.find((i) => (i as HTMLInputElement).checked) as HTMLInputElement;
          const label = root.querySelector(labelSelector);
          if (label && selected) {
            label.textContent = selected.parentElement?.textContent?.trim() ?? "";
          }
          render();
        });
      });
    }
  }

  setupDropdown("filters", [...rarityInputs, ...typeInputs, ...characterInputs]);
  setupDropdown("sort", sortInputs, "[data-sort-label]");

  document.addEventListener("click", () => {
    root.querySelectorAll("[data-dropdown-panel]").forEach((p) => p.classList.remove("wd-dropdown__panel--open"));
  });
}

document.querySelectorAll("[data-weapon-directory]").forEach((root) => {
  if (root instanceof HTMLElement) {
    initWeaponDirectory(root);
  }
});
