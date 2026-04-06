import { getOrderedRarityOptions } from "./rarity";

const compareText = (left: string, right: string) => left.localeCompare(right);

function compareRarity(left: string, right: string): number {
  const order = getOrderedRarityOptions([left, right]);
  return order.indexOf(left) - order.indexOf(right);
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initCategoryDirectory(root: HTMLElement) {
  // ── Element refs ──
  const searchInput = root.querySelector<HTMLInputElement>("[data-search]");
  const searchClear = root.querySelector<HTMLButtonElement>("[data-search-clear]");
  const sortInputs = [...root.querySelectorAll<HTMLInputElement>("[data-sort-option]")];
  const sortLabel = root.querySelector<HTMLElement>("[data-sort-label]");
  const rarityInputs = [...root.querySelectorAll<HTMLInputElement>("[data-rarity]")];
  const typeInputs = [...root.querySelectorAll<HTMLInputElement>("[data-type-filter]")];
  const resultsGrid = root.querySelector<HTMLElement>("[data-results]");
  const emptyState = root.querySelector<HTMLElement>("[data-empty]");
  const countNode = root.querySelector<HTMLElement>("[data-count]");
  const chipsBar = root.querySelector<HTMLElement>("[data-chips]");
  const resetBtn = root.querySelector<HTMLButtonElement>("[data-reset-filters]");
  const rarityCountNodes = [...root.querySelectorAll<HTMLElement>('[data-filter-count="rarity"]')];
  const typeCountNodes = [...root.querySelectorAll<HTMLElement>('[data-filter-count="type"]')];

  // All cards — read data-* attrs set by Astro at build time
  const allCards = [...root.querySelectorAll<HTMLElement>("[data-card]")];

  // ── State ──
  const getChecked = (inputs: HTMLInputElement[]) =>
    inputs.filter((i) => i.checked).map((i) => i.value);

  const getState = () => ({
    query: searchInput?.value.trim().toLowerCase() ?? "",
    selectedRarities: getChecked(rarityInputs),
    selectedTypes: getChecked(typeInputs),
    sort: sortInputs.find((i) => i.checked)?.value ?? "name-asc",
  });

  const clearAll = () => {
    if (searchInput) searchInput.value = "";
    rarityInputs.forEach((i) => (i.checked = false));
    typeInputs.forEach((i) => (i.checked = false));
    render();
  };

  // ── Chip renderer ──
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
        <span class="wd-chip__label wd-chip__dot wd-chip__dot--${escHtml(r)}">${escHtml(r)}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>`);
    }
    for (const t of state.selectedTypes) {
      chips.push(`<button class="wd-chip" data-chip-action="type" data-chip-value="${escHtml(t)}">
        <span class="wd-chip__label">${escHtml(t)}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>`);
    }

    const hasAny = chips.length > 0;
    chipsBar.innerHTML = hasAny
      ? chips.join("") + `<button class="wd-chip wd-chip--clear-all" data-chip-action="clear-all">Clear all</button>`
      : "";
    chipsBar.classList.toggle("wd-chips--visible", hasAny);
  };

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
      case "clear-all":
        clearAll();
        return;
    }
    render();
  });

  resetBtn?.addEventListener("click", clearAll);
  searchClear?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    render();
    searchInput?.focus();
  });

  // ── Badge helpers ──
  function updateBadge(badge: Element | null, count: number) {
    if (!badge) return;
    badge.textContent = String(count);
    badge.classList.toggle("wd-dropdown__badge--visible", count > 0);
  }

  function updateAllBadges(state: ReturnType<typeof getState>) {
    updateBadge(root.querySelector('[data-dropdown-count="rarity"]'), state.selectedRarities.length);
    updateBadge(root.querySelector('[data-dropdown-count="type"]'), state.selectedTypes.length);
  }

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

  setupDropdown("rarity");
  setupDropdown("type");
  setupDropdown("sort");

  document.addEventListener("click", () => {
    root.querySelectorAll("[data-dropdown-panel]").forEach((p) => p.classList.remove("wd-dropdown__panel--open"));
  });

  sortInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const label = input.parentElement?.querySelector("span")?.textContent?.trim() ?? "";
      if (sortLabel) sortLabel.textContent = label;
      render();
    });
  });

  // ── Main render (DOM show/hide + reorder) ──
  const render = () => {
    const state = getState();

    // Determine which cards pass filters
    const visible: HTMLElement[] = [];
    const hidden: HTMLElement[] = [];

    for (const card of allCards) {
      const name = card.dataset.name ?? "";
      const rarity = card.dataset.rarity ?? "unclassified";
      const type = card.dataset.type ?? "";

      let pass = true;
      if (state.query && !name.includes(state.query)) pass = false;
      if (pass && state.selectedRarities.length > 0 && !state.selectedRarities.includes(rarity)) pass = false;
      if (pass && state.selectedTypes.length > 0 && !state.selectedTypes.includes(type)) pass = false;

      if (pass) visible.push(card);
      else hidden.push(card);
    }

    // Sort visible cards
    visible.sort((a, b) => {
      const aName = a.dataset.name ?? "";
      const bName = b.dataset.name ?? "";
      const aRarity = a.dataset.rarity ?? "unclassified";
      const bRarity = b.dataset.rarity ?? "unclassified";
      const aType = a.dataset.type ?? "";
      const bType = b.dataset.type ?? "";
      switch (state.sort) {
        case "name-desc": return compareText(bName, aName);
        case "rarity-asc": return compareRarity(aRarity, bRarity);
        case "rarity-desc": return compareRarity(bRarity, aRarity);
        case "type-asc": return compareText(aType, bType);
        case "type-desc": return compareText(bType, aType);
        default: return compareText(aName, bName);
      }
    });

    // Show/hide cards + reorder in DOM
    hidden.forEach((c) => (c.style.display = "none"));
    visible.forEach((c) => {
      c.style.display = "";
      resultsGrid?.appendChild(c); // reorder by appending in sorted order
    });

    // Empty state
    if (emptyState) emptyState.style.display = visible.length === 0 ? "" : "none";

    // Update count
    if (countNode) countNode.textContent = String(visible.length);

    // Live option counts — count visible per rarity/type
    const rarityCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    for (const card of allCards) {
      // For option counts: count cards that pass ALL filters EXCEPT the one being counted
      const name = card.dataset.name ?? "";
      const rarity = card.dataset.rarity ?? "unclassified";
      const type = card.dataset.type ?? "";
      const passQuery = !state.query || name.includes(state.query);
      const passType = state.selectedTypes.length === 0 || state.selectedTypes.includes(type);
      const passRarity = state.selectedRarities.length === 0 || state.selectedRarities.includes(rarity);

      if (passQuery && passType) rarityCounts[rarity] = (rarityCounts[rarity] ?? 0) + 1;
      if (passQuery && passRarity) typeCounts[type] = (typeCounts[type] ?? 0) + 1;
    }

    rarityCountNodes.forEach((node) => {
      node.textContent = String(rarityCounts[node.dataset.filterValue ?? ""] ?? 0);
    });
    typeCountNodes.forEach((node) => {
      node.textContent = String(typeCounts[node.dataset.filterValue ?? ""] ?? 0);
    });

    // Search clear visibility
    if (searchClear) {
      searchClear.style.opacity = state.query ? "1" : "0";
      searchClear.style.pointerEvents = state.query ? "auto" : "none";
    }

    renderChips(state);
    updateAllBadges(state);
  };

  // ── Wire inputs ──
  let debounceTimer: ReturnType<typeof setTimeout>;
  const debouncedRender = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 120);
  };

  searchInput?.addEventListener("input", debouncedRender);
  rarityInputs.forEach((i) => i.addEventListener("change", render));
  typeInputs.forEach((i) => i.addEventListener("change", render));

  // ── Initial render ──
  render();
}

document.querySelectorAll<HTMLElement>("[data-category-directory]").forEach((root) => {
  initCategoryDirectory(root);
});
