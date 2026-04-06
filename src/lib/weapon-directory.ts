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

  // ── Element refs ──
  const searchInput = root.querySelector<HTMLInputElement>("[data-search]");
  const searchClear = root.querySelector<HTMLButtonElement>("[data-search-clear]");
  const sortInputs = [...root.querySelectorAll<HTMLInputElement>("[data-sort-option]")];
  const sortLabel = root.querySelector("[data-sort-label]");
  const rarityInputs = [...root.querySelectorAll<HTMLInputElement>("[data-rarity]")];
  const typeInputs = [...root.querySelectorAll<HTMLInputElement>("[data-type]")];
  const characterInputs = [...root.querySelectorAll<HTMLInputElement>("[data-character]")];
  const hasCraftingInput = root.querySelector<HTMLInputElement>("[data-has-crafting]");
  const hasSocketsInput = root.querySelector<HTMLInputElement>("[data-has-sockets]");
  const minDamageInput = root.querySelector<HTMLInputElement>("[data-min-damage]");
  const maxDamageInput = root.querySelector<HTMLInputElement>("[data-max-damage]");
  const results = root.querySelector<HTMLElement>("[data-results]");
  const countNode = root.querySelector("[data-count]");
  const chipsBar = root.querySelector<HTMLElement>("[data-chips]");
  const rarityCountNodes = [...root.querySelectorAll<HTMLElement>('[data-filter-count="rarity"]')];
  const typeCountNodes = [...root.querySelectorAll<HTMLElement>('[data-filter-count="type"]')];
  const characterCountNodes = [...root.querySelectorAll<HTMLElement>('[data-filter-count="character"]')];

  // ── State helpers ──
  const getChecked = (inputs: HTMLInputElement[]) =>
    inputs.filter((i) => i.checked).map((i) => i.value);

  const getState = () => ({
    query: searchInput?.value.trim().toLowerCase() ?? "",
    selectedRarities: getChecked(rarityInputs),
    selectedTypes: getChecked(typeInputs),
    selectedCharacters: getChecked(characterInputs),
    hasCrafting: hasCraftingInput?.checked ?? false,
    hasSockets: hasSocketsInput?.checked ?? false,
    minDamage: minDamageInput?.value ? Number(minDamageInput.value) : null,
    maxDamage: maxDamageInput?.value ? Number(maxDamageInput.value) : null,
    sort: sortInputs.find((i) => i.checked)?.value ?? "name-asc",
  });

  // ── Filter counts (for live counts in dropdowns) ──
  const getFilterCounts = (state: ReturnType<typeof getState>) => {
    const { query, selectedRarities, selectedTypes, selectedCharacters } = state;

    const queryMatches = weapons.filter((w) => {
      if (!query) return true;
      return (
        w.name.toLowerCase().includes(query) ||
        w.type.toLowerCase().includes(query) ||
        (w.character?.toLowerCase().includes(query) ?? false)
      );
    });

    const rarityPool = queryMatches.filter(
      (w) => selectedTypes.length === 0 || selectedTypes.includes(w.type)
    );
    const typePool = queryMatches.filter(
      (w) => selectedRarities.length === 0 || selectedRarities.includes(w.rarity)
    );
    const characterPool = queryMatches.filter(
      (w) => selectedRarities.length === 0 || selectedRarities.includes(w.rarity)
    );

    const countBy = <T extends WeaponListItem>(pool: T[], key: keyof T) => {
      const map: Record<string, number> = {};
      for (const w of pool) {
        const val = String(w[key] ?? "");
        map[val] = (map[val] ?? 0) + 1;
      }
      return map;
    };

    return {
      total: queryMatches.filter(
        (w) =>
          (selectedRarities.length === 0 || selectedRarities.includes(w.rarity)) &&
          (selectedTypes.length === 0 || selectedTypes.includes(w.type)) &&
          (selectedCharacters.length === 0 || selectedCharacters.includes(w.character ?? ""))
      ).length,
      rarityCounts: countBy(rarityPool, "rarity"),
      typeCounts: countBy(typePool, "type"),
      characterCounts: countBy(characterPool, "character" as keyof WeaponListItem),
    };
  };

  // ── Card renderer ──
  const rarityClass = (rarity: string) => `wd-card__rarity--${rarity}`;
  const badgeHtml = (w: WeaponListItem) => {
    const parts: string[] = [];
    if (w.hasCrafting) parts.push('<span class="wd-badge wd-badge--crafting">Craftable</span>');
    if (w.hasSockets) parts.push('<span class="wd-badge wd-badge--socket">Socketed</span>');
    return parts.length ? `<div class="wd-badge-row">${parts.join("")}</div>` : "";
  };

  const renderCard = (w: WeaponListItem) => `
    <article class="wd-card" data-card>
      <div class="wd-card__top">
        <div>
          <p class="wd-card__type">${escHtml(w.typeLabel)}</p>
          <a href="/weapon/${escHtml(w.slug)}" class="wd-card__name">${escHtml(w.name)}</a>
          ${w.character ? `<p class="wd-card__meta">${escHtml(w.character)}</p>` : ""}
        </div>
        <span class="wd-card__rarity ${rarityClass(w.rarity)}">${escHtml(w.rarity)}</span>
      </div>
      <div class="wd-card__stats-group">
        ${w.character ? `<div class="wd-card__stats-row"><div class="wd-card__stat wd-card__stat--full"><div class="wd-card__stat-label">Character</div><div class="wd-card__stat-value wd-card__stat-value--text">${escHtml(w.character)}</div></div></div>` : ""}
        <div class="wd-card__stats-row">
          <div class="wd-card__stat">
            <div class="wd-card__stat-label">Base DMG</div>
            <div class="wd-card__stat-value">${w.stats.baseDamage ?? "—"}</div>
          </div>
          <div class="wd-card__stat">
            <div class="wd-card__stat-label">Final DMG</div>
            <div class="wd-card__stat-value wd-card__stat-value--accent">${w.stats.finalDamage ?? "—"}</div>
          </div>
        </div>
        ${badgeHtml(w) ? `<div class="wd-card__stats-row"><div class="wd-card__stat wd-card__stat--full">${badgeHtml(w)}</div></div>` : ""}
      </div>
      <a href="/weapon/${escHtml(w.slug)}" class="wd-card__link">
        View details
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
        </svg>
      </a>
    </article>`;

  function escHtml(str: string) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ── Active chips renderer ──
  const renderChips = (state: ReturnType<typeof getState>) => {
    if (!chipsBar) return;
    const chips: string[] = [];

    if (state.query) {
      chips.push(`<button class="wd-chip" data-chip-action="clear-query">
        <span class="wd-chip__label">Search: "${escHtml(state.query)}"</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>`);
    }

    for (const r of state.selectedRarities) {
      chips.push(`<button class="wd-chip wd-chip--rarity" data-chip-action="rarity" data-chip-value="${escHtml(r)}">
        <span class="wd-chip__label wd-chip__dot wd-chip__dot--${r}">${escHtml(r)}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>`);
    }

    for (const t of state.selectedTypes) {
      chips.push(`<button class="wd-chip" data-chip-action="type" data-chip-value="${escHtml(t)}">
        <span class="wd-chip__label">${escHtml(t)}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>`);
    }

    for (const c of state.selectedCharacters) {
      chips.push(`<button class="wd-chip" data-chip-action="character" data-chip-value="${escHtml(c)}">
        <span class="wd-chip__label">${escHtml(c)}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>`);
    }

    if (state.hasCrafting) {
      chips.push(`<button class="wd-chip" data-chip-action="has-crafting">
        <span class="wd-chip__label">Craftable</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>`);
    }

    if (state.hasSockets) {
      chips.push(`<button class="wd-chip" data-chip-action="has-sockets">
        <span class="wd-chip__label">Has Sockets</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>`);
    }

    if (state.minDamage !== null) {
      chips.push(`<button class="wd-chip" data-chip-action="min-damage">
        <span class="wd-chip__label">Min DMG: ${state.minDamage}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>`);
    }

    if (state.maxDamage !== null) {
      chips.push(`<button class="wd-chip" data-chip-action="max-damage">
        <span class="wd-chip__label">Max DMG: ${state.maxDamage}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>`);
    }

    const hasAny = chips.length > 0;
    chipsBar.innerHTML = hasAny
      ? chips.join("") +
        `<button class="wd-chip wd-chip--clear-all" data-chip-action="clear-all">
          Clear all
        </button>`
      : "";
    chipsBar.classList.toggle("wd-chips--visible", hasAny);
  };

  // ── Chip click handler ──
  chipsBar?.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest<HTMLElement>("[data-chip-action]");
    if (!btn) return;
    const action = btn.dataset.chipAction!;
    const value = btn.dataset.chipValue ?? "";

    switch (action) {
      case "clear-query":
        if (searchInput) searchInput.value = "";
        break;
      case "rarity": {
        const inp = rarityInputs.find((i) => i.value === value);
        if (inp) inp.checked = false;
        break;
      }
      case "type": {
        const inp = typeInputs.find((i) => i.value === value);
        if (inp) inp.checked = false;
        break;
      }
      case "character": {
        const inp = characterInputs.find((i) => i.value === value);
        if (inp) inp.checked = false;
        break;
      }
      case "has-crafting":
        if (hasCraftingInput) hasCraftingInput.checked = false;
        break;
      case "has-sockets":
        if (hasSocketsInput) hasSocketsInput.checked = false;
        break;
      case "min-damage":
        if (minDamageInput) minDamageInput.value = "";
        break;
      case "max-damage":
        if (maxDamageInput) maxDamageInput.value = "";
        break;
      case "clear-all":
        if (searchInput) searchInput.value = "";
        rarityInputs.forEach((i) => (i.checked = false));
        typeInputs.forEach((i) => (i.checked = false));
        characterInputs.forEach((i) => (i.checked = false));
        if (hasCraftingInput) hasCraftingInput.checked = false;
        if (hasSocketsInput) hasSocketsInput.checked = false;
        if (minDamageInput) minDamageInput.value = "";
        if (maxDamageInput) maxDamageInput.value = "";
        break;
    }
    render();
  });

  // ── Search clear button ──
  searchClear?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    render();
    searchInput?.focus();
  });

  // ── Main render function ──
  const render = () => {
    const state = getState();
    const filterCounts = getFilterCounts(state);

    // Filter weapons
    let filtered = weapons.filter((w) => {
      if (state.query) {
        const q = state.query;
        const matchesQ =
          w.name.toLowerCase().includes(q) ||
          w.type.toLowerCase().includes(q) ||
          (w.character?.toLowerCase().includes(q) ?? false);
        if (!matchesQ) return false;
      }

      if (state.selectedRarities.length > 0 && !state.selectedRarities.includes(w.rarity)) return false;
      if (state.selectedTypes.length > 0 && !state.selectedTypes.includes(w.type)) return false;
      if (state.selectedCharacters.length > 0 && !state.selectedCharacters.includes(w.character ?? "")) return false;
      if (state.hasCrafting && !w.hasCrafting) return false;
      if (state.hasSockets && !w.hasSockets) return false;
      if (state.minDamage !== null && (w.stats.baseDamage ?? -1) < state.minDamage) return false;
      if (state.maxDamage !== null && (w.stats.baseDamage ?? -1) > state.maxDamage) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (state.sort) {
        case "name-desc": return compareText(b.name, a.name);
        case "baseDamage-desc": return compareNumber(b.stats.baseDamage ?? -1, a.stats.baseDamage ?? -1);
        case "baseDamage-asc": return compareNumber(a.stats.baseDamage ?? -1, b.stats.baseDamage ?? -1);
        case "finalDamage-desc": return compareNumber(b.stats.finalDamage ?? -1, a.stats.finalDamage ?? -1);
        case "finalDamage-asc": return compareNumber(a.stats.finalDamage ?? -1, b.stats.finalDamage ?? -1);
        case "rarity-asc": return compareRarity(a.rarity, b.rarity);
        case "rarity-desc": return compareRarity(b.rarity, a.rarity);
        case "character-asc": return compareText(a.character ?? "", b.character ?? "");
        case "character-desc": return compareText(b.character ?? "", a.character ?? "");
        default: return compareText(a.name, b.name);
      }
    });

    // Update result count
    if (countNode) countNode.textContent = String(filtered.length);

    // Update dropdown counts
    rarityCountNodes.forEach((node) => {
      const val = node.dataset.filterValue ?? "";
      node.textContent = String(filterCounts.rarityCounts[val] ?? 0);
    });
    typeCountNodes.forEach((node) => {
      const val = node.dataset.filterValue ?? "";
      node.textContent = String(filterCounts.typeCounts[val] ?? 0);
    });
    characterCountNodes.forEach((node) => {
      const val = node.dataset.filterValue ?? "";
      node.textContent = String(filterCounts.characterCounts[val] ?? 0);
    });

    // Update search clear button visibility
    if (searchClear) {
      searchClear.style.opacity = state.query ? "1" : "0";
      searchClear.style.pointerEvents = state.query ? "auto" : "none";
    }

    // Render cards
    if (results) {
      if (filtered.length === 0) {
        results.innerHTML = `<div class="wd-empty"><p class="wd-empty__text">No weapons match your filters.</p><button class="wd-empty__reset" data-chip-action="clear-all">Reset filters</button></div>`;
        // Wire the reset button inside empty state
        results.querySelector("[data-chip-action='clear-all']")?.addEventListener("click", () => {
          if (searchInput) searchInput.value = "";
          rarityInputs.forEach((i) => (i.checked = false));
          typeInputs.forEach((i) => (i.checked = false));
          characterInputs.forEach((i) => (i.checked = false));
          if (hasCraftingInput) hasCraftingInput.checked = false;
          if (hasSocketsInput) hasSocketsInput.checked = false;
          if (minDamageInput) minDamageInput.value = "";
          if (maxDamageInput) maxDamageInput.value = "";
          render();
        });
      } else {
        results.innerHTML = filtered.map(renderCard).join("");
      }
    }

    // Render chips
    renderChips(state);
    updateAllBadges(state);
  };

  // ── Badge helpers ──
  function updateBadge(badge: Element | null, count: number) {
    if (!badge) return;
    badge.textContent = String(count);
    badge.classList.toggle("wd-dropdown__badge--visible", count > 0);
  }

  function updateAllBadges(state: ReturnType<typeof getState>) {
    updateBadge(root.querySelector('[data-dropdown-count="rarity"]'), state.selectedRarities.length);
    updateBadge(root.querySelector('[data-dropdown-count="type"]'), state.selectedTypes.length);
    updateBadge(root.querySelector('[data-dropdown-count="character"]'), state.selectedCharacters.length);
    const extrasCount = (state.hasCrafting ? 1 : 0) + (state.hasSockets ? 1 : 0);
    updateBadge(root.querySelector('[data-dropdown-count="extras"]'), extrasCount);
    const damageCount = (state.minDamage !== null ? 1 : 0) + (state.maxDamage !== null ? 1 : 0);
    updateBadge(root.querySelector('[data-dropdown-count="damage"]'), damageCount);
    const totalFilters =
      state.selectedRarities.length +
      state.selectedTypes.length +
      state.selectedCharacters.length +
      extrasCount + damageCount;
    updateBadge(root.querySelector('[data-dropdown-count="filters"]'), totalFilters);
  }

  // ── Filter group toggles ──
  root.querySelectorAll("[data-filter-group-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const group = (btn as HTMLElement).closest(".wd-filter-group");
      if (group) group.classList.toggle("wd-filter-group--open");
    });
  });

  // ── Dropdown open/close ──
  function setupDropdown(name: string) {
    const btn = root.querySelector(`[data-dropdown-btn="${name}"]`);
    const panel = root.querySelector(`[data-dropdown-panel="${name}"]`);
    if (!btn || !panel) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.contains("wd-dropdown__panel--open");
      root.querySelectorAll("[data-dropdown-panel]").forEach((p) => p.classList.remove("wd-dropdown__panel--open"));
      if (!isOpen) panel.classList.add("wd-dropdown__panel--open");
    });

    panel.addEventListener("click", (e) => e.stopPropagation());
  }

  setupDropdown("filters");
  setupDropdown("sort");

  document.addEventListener("click", () => {
    root.querySelectorAll("[data-dropdown-panel]").forEach((p) => p.classList.remove("wd-dropdown__panel--open"));
  });

  // ── Sort label update ──
  sortInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const label = input.parentElement?.textContent?.trim() ?? "";
      if (sortLabel) sortLabel.textContent = label;
      render();
    });
  });

  // ── Wire all filter inputs ──
  let debounceTimer: ReturnType<typeof setTimeout>;
  const debouncedRender = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 120);
  };

  searchInput?.addEventListener("input", debouncedRender);
  rarityInputs.forEach((i) => i.addEventListener("change", render));
  typeInputs.forEach((i) => i.addEventListener("change", render));
  characterInputs.forEach((i) => i.addEventListener("change", render));
  hasCraftingInput?.addEventListener("change", render);
  hasSocketsInput?.addEventListener("change", render);
  minDamageInput?.addEventListener("input", debouncedRender);
  maxDamageInput?.addEventListener("input", debouncedRender);

  // ── Initial render ──
  render();
}

document.querySelectorAll("[data-weapon-directory]").forEach((root) => {
  if (root instanceof HTMLElement) initWeaponDirectory(root);
});
