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
  const searchInput    = root.querySelector<HTMLInputElement>("[data-search]");
  const searchClear    = root.querySelector<HTMLButtonElement>("[data-search-clear]");
  const sortInputs     = [...root.querySelectorAll<HTMLInputElement>("[data-sort-option]")];
  const sortLabel      = root.querySelector<HTMLElement>("[data-sort-label]");
  const rarityInputs   = [...root.querySelectorAll<HTMLInputElement>("[data-rarity]")];
  const typeLabelInputs = [...root.querySelectorAll<HTMLInputElement>("[data-type-label-filter]")];
  const statInputs     = [...root.querySelectorAll<HTMLInputElement>("[data-stat-filter]")];
  const hasCraftingInput   = root.querySelector<HTMLInputElement>("[data-has-crafting]");
  const hasRefinementInput = root.querySelector<HTMLInputElement>("[data-has-refinement]");
  const resultsGrid    = root.querySelector<HTMLElement>("[data-results]");
  const emptyState     = root.querySelector<HTMLElement>("[data-empty]");
  const countNode      = root.querySelector<HTMLElement>("[data-count]");
  const chipsBar       = root.querySelector<HTMLElement>("[data-chips]");
  const resetBtn       = root.querySelector<HTMLButtonElement>("[data-reset-filters]");

  // Count nodes for live option counts
  const rarityCountNodes   = [...root.querySelectorAll<HTMLElement>('[data-filter-count="rarity"]')];
  const typeLabelCountNodes = [...root.querySelectorAll<HTMLElement>('[data-filter-count="typeLabel"]')];
  const statCountNodes     = [...root.querySelectorAll<HTMLElement>('[data-filter-count="statType"]')];

  // All cards — data-* attrs set by Astro at build time
  const allCards = [...root.querySelectorAll<HTMLElement>("[data-card]")];

  // ── State ──
  const getChecked = (inputs: HTMLInputElement[]) =>
    inputs.filter((i) => i.checked).map((i) => i.value);

  const getState = () => ({
    query:            searchInput?.value.trim().toLowerCase() ?? "",
    selectedRarities: getChecked(rarityInputs),
    selectedTypeLabels: getChecked(typeLabelInputs),
    selectedStats:    getChecked(statInputs),
    hasCrafting:      hasCraftingInput?.checked ?? false,
    hasRefinement:    hasRefinementInput?.checked ?? false,
    sort:             sortInputs.find((i) => i.checked)?.value ?? "name-asc",
  });

  const clearAll = () => {
    if (searchInput) searchInput.value = "";
    rarityInputs.forEach((i) => (i.checked = false));
    typeLabelInputs.forEach((i) => (i.checked = false));
    statInputs.forEach((i) => (i.checked = false));
    if (hasCraftingInput) hasCraftingInput.checked = false;
    if (hasRefinementInput) hasRefinementInput.checked = false;
    render();
  };

  // ── Chip renderer ──
  const XSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>`;

  const renderChips = (state: ReturnType<typeof getState>) => {
    if (!chipsBar) return;
    const chips: string[] = [];

    if (state.query) {
      chips.push(`<button class="wd-chip" data-chip-action="clear-query"><span class="wd-chip__label">Search: "${escHtml(state.query)}"</span>${XSVG}</button>`);
    }
    for (const r of state.selectedRarities) {
      chips.push(`<button class="wd-chip wd-chip--rarity" data-chip-action="rarity" data-chip-value="${escHtml(r)}"><span class="wd-chip__label wd-chip__dot wd-chip__dot--${escHtml(r)}">${escHtml(r)}</span>${XSVG}</button>`);
    }
    for (const tl of state.selectedTypeLabels) {
      chips.push(`<button class="wd-chip" data-chip-action="typeLabel" data-chip-value="${escHtml(tl)}"><span class="wd-chip__label">${escHtml(tl)}</span>${XSVG}</button>`);
    }
    for (const s of state.selectedStats) {
      chips.push(`<button class="wd-chip" data-chip-action="stat" data-chip-value="${escHtml(s)}"><span class="wd-chip__label">Stat: ${escHtml(s)}</span>${XSVG}</button>`);
    }
    if (state.hasCrafting) {
      chips.push(`<button class="wd-chip" data-chip-action="hasCrafting"><span class="wd-chip__label">Has Crafting</span>${XSVG}</button>`);
    }
    if (state.hasRefinement) {
      chips.push(`<button class="wd-chip" data-chip-action="hasRefinement"><span class="wd-chip__label">Has Refinement</span>${XSVG}</button>`);
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
    const value  = btn.dataset.chipValue ?? "";
    switch (action) {
      case "clear-query":   if (searchInput) searchInput.value = ""; break;
      case "rarity":        { const i = rarityInputs.find((x) => x.value === value);    if (i) i.checked = false; break; }
      case "typeLabel":     { const i = typeLabelInputs.find((x) => x.value === value); if (i) i.checked = false; break; }
      case "stat":          { const i = statInputs.find((x) => x.value === value);      if (i) i.checked = false; break; }
      case "hasCrafting":   if (hasCraftingInput)   hasCraftingInput.checked   = false; break;
      case "hasRefinement": if (hasRefinementInput)  hasRefinementInput.checked = false; break;
      case "clear-all":     clearAll(); return;
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
    updateBadge(root.querySelector('[data-dropdown-count="rarity"]'),    state.selectedRarities.length);
    updateBadge(root.querySelector('[data-dropdown-count="typeLabel"]'),  state.selectedTypeLabels.length);
    updateBadge(root.querySelector('[data-dropdown-count="statType"]'),   state.selectedStats.length);
    const specialCount = (state.hasCrafting ? 1 : 0) + (state.hasRefinement ? 1 : 0);
    updateBadge(root.querySelector('[data-dropdown-count="special"]'),    specialCount);
    const totalFilters = state.selectedRarities.length + state.selectedTypeLabels.length +
      state.selectedStats.length + specialCount;
    updateBadge(root.querySelector('[data-dropdown-count="filters"]'),   totalFilters);
  }

  // ── Filter group toggles ──
  root.querySelectorAll<HTMLElement>("[data-filter-group-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const group = btn.closest<HTMLElement>("[data-filter-group]");
      if (group) group.classList.toggle("wd-filter-group--open");
    });
  });

  // ── Dropdown open/close ──
  function setupDropdown(name: string) {
    const btn   = root.querySelector(`[data-dropdown-btn="${name}"]`);
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
    const visible: HTMLElement[] = [];
    const hidden:  HTMLElement[] = [];

    for (const card of allCards) {
      const name        = card.dataset.name       ?? "";
      const rarity      = card.dataset.rarity     ?? "unclassified";
      const typeLabel   = card.dataset.typeLabel   ?? "";
      const hasCrafting = card.dataset.hasCrafting === "true";
      const hasRefine   = card.dataset.hasRefinement === "true";
      const statLabels  = card.dataset.statLabels ? card.dataset.statLabels.split("|") : [];

      let pass = true;
      if (state.query && !name.includes(state.query))                                              pass = false;
      if (pass && state.selectedRarities.length   > 0 && !state.selectedRarities.includes(rarity))   pass = false;
      if (pass && state.selectedTypeLabels.length > 0 && !state.selectedTypeLabels.includes(typeLabel)) pass = false;
      if (pass && state.selectedStats.length      > 0 && !state.selectedStats.every((s) => statLabels.includes(s))) pass = false;
      if (pass && state.hasCrafting  && !hasCrafting) pass = false;
      if (pass && state.hasRefinement && !hasRefine)  pass = false;

      if (pass) visible.push(card);
      else      hidden.push(card);
    }

    // Sort visible cards
    visible.sort((a, b) => {
      const aName  = a.dataset.name      ?? "";
      const bName  = b.dataset.name      ?? "";
      const aR     = a.dataset.rarity    ?? "unclassified";
      const bR     = b.dataset.rarity    ?? "unclassified";
      const aTL    = a.dataset.typeLabel  ?? "";
      const bTL    = b.dataset.typeLabel  ?? "";
      switch (state.sort) {
        case "name-desc":      return compareText(bName, aName);
        case "rarity-asc":     return compareRarity(aR, bR);
        case "rarity-desc":    return compareRarity(bR, aR);
        case "typeLabel-asc":  return compareText(aTL, bTL);
        case "typeLabel-desc": return compareText(bTL, aTL);
        default:               return compareText(aName, bName);
      }
    });

    // Show/hide + reorder
    hidden.forEach((c) => (c.style.display = "none"));
    visible.forEach((c) => { c.style.display = ""; resultsGrid?.appendChild(c); });

    // Empty state
    if (emptyState) emptyState.style.display = visible.length === 0 ? "" : "none";
    if (countNode)  countNode.textContent = String(visible.length);

    // Live option counts (exclude own filter axis when counting)
    const rarityCounts:   Record<string, number> = {};
    const typeLabelCounts: Record<string, number> = {};
    const statCounts:     Record<string, number> = {};

    for (const card of allCards) {
      const name       = card.dataset.name      ?? "";
      const rarity     = card.dataset.rarity    ?? "unclassified";
      const typeLabel  = card.dataset.typeLabel  ?? "";
      const hasCraft   = card.dataset.hasCrafting   === "true";
      const hasRef     = card.dataset.hasRefinement === "true";
      const statLabels = card.dataset.statLabels ? card.dataset.statLabels.split("|") : [];

      const passQ  = !state.query || name.includes(state.query);
      const passCraft = !state.hasCrafting  || hasCraft;
      const passRef   = !state.hasRefinement || hasRef;
      const passStat  = state.selectedStats.length === 0 || state.selectedStats.every((s) => statLabels.includes(s));
      const passTL    = state.selectedTypeLabels.length === 0 || state.selectedTypeLabels.includes(typeLabel);
      const passR     = state.selectedRarities.length  === 0 || state.selectedRarities.includes(rarity);

      // Rarity counts: everything except rarity filter
      if (passQ && passTL && passStat && passCraft && passRef)
        rarityCounts[rarity] = (rarityCounts[rarity] ?? 0) + 1;
      // TypeLabel counts: everything except typeLabel filter
      if (passQ && passR && passStat && passCraft && passRef)
        typeLabelCounts[typeLabel] = (typeLabelCounts[typeLabel] ?? 0) + 1;
      // Stat counts: everything except stat filter
      if (passQ && passR && passTL && passCraft && passRef) {
        for (const sl of statLabels)
          statCounts[sl] = (statCounts[sl] ?? 0) + 1;
      }
    }

    rarityCountNodes.forEach((n)   => { n.textContent = String(rarityCounts[n.dataset.filterValue   ?? ""] ?? 0); });
    typeLabelCountNodes.forEach((n) => { n.textContent = String(typeLabelCounts[n.dataset.filterValue ?? ""] ?? 0); });
    statCountNodes.forEach((n)     => { n.textContent = String(statCounts[n.dataset.filterValue      ?? ""] ?? 0); });

    // Search clear visibility
    if (searchClear) {
      searchClear.style.opacity     = state.query ? "1" : "0";
      searchClear.style.pointerEvents = state.query ? "auto" : "none";
    }

    renderChips(state);
    updateAllBadges(state);
  };

  // ── Wire all inputs ──
  let debounceTimer: ReturnType<typeof setTimeout>;
  const debouncedRender = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(render, 120); };

  searchInput?.addEventListener("input", debouncedRender);
  rarityInputs.forEach((i)    => i.addEventListener("change", render));
  typeLabelInputs.forEach((i) => i.addEventListener("change", render));
  statInputs.forEach((i)      => i.addEventListener("change", render));
  hasCraftingInput?.addEventListener("change", render);
  hasRefinementInput?.addEventListener("change", render);

  render();
}

document.querySelectorAll<HTMLElement>("[data-category-directory]").forEach((root) => {
  initCategoryDirectory(root);
});
