# Other Category Pipeline Plan

## Purpose

This plan extends the existing weapons-only pipeline to the remaining Crimson Desert categories without changing the repo's current architecture.

The target remains:

1. crawl source pages
2. save raw HTML under `sources/`
3. parse source-specific records and manifests under `data/generated/`
4. normalize into clean final JSON under `data/`
5. leave the Astro routes to consume only the final JSON

This document is intentionally pipeline-only. Frontend implementation details are out of scope except where a pipeline must emit a final JSON contract for a route to consume.

## Existing Pattern To Reuse

Weapons already establishes the category-first pattern:

- `scripts/crawl/`
  - fetch category index
  - discover subcategory/detail URLs
  - fetch paginated listing pages
  - fetch detail pages
- `scripts/parse/`
  - derive URL manifests and category-specific link extraction
- `scripts/build/`
  - emit verification JSON, listing snapshots, and unique detail-page manifests
- `scripts/normalize/`
  - parse detail HTML into a clean category JSON file
- `scripts/lib/`
  - shared source IDs, category IDs, raw storage, and schema helpers

The remaining categories should follow this same boundary instead of introducing a new generic framework too early.

## Delivery Order

Recommended rollout order:

1. `shields`
2. `armors`
3. `abyss-gear`
4. `bosses`
5. `mounts`
6. `quests-main`
7. `quests-faction`

Why this order:

- `shields`, `armors`, and `abyss-gear` are structurally closest to weapons and should validate the reusable equipment pipeline shape.
- `bosses` and `mounts` likely introduce different fields but still look entity-detail driven.
- `quests` are most likely to need custom parsing for objectives, rewards, and chains, so they should come after the equipment/entity patterns are stable.

## Shared Pipeline Expansion

Before category-specific work, add these shared pipeline capabilities.

### 1. Category-aware script entry points

Current scripts are weapon-specific. Expand to one category-specific entry per stage:

- `scripts/crawl/crimsondesert-gg-shields.ts`
- `scripts/crawl/crimsondesert-gg-armors.ts`
- `scripts/crawl/crimsondesert-gg-abyss-gear.ts`
- `scripts/crawl/crimsondesert-gg-bosses.ts`
- `scripts/crawl/crimsondesert-gg-mounts.ts`
- `scripts/crawl/crimsondesert-gg-quests-main.ts`
- `scripts/crawl/crimsondesert-gg-quests-faction.ts`

And matching parse, build, and normalize files.

Keep `scripts/*/index.ts` as thin orchestration entry points. Do not collapse all category logic into one giant switch file.

### 2. Shared category helpers

Add small shared helpers only where the weapons pipeline already proves repeated behavior:

- source path builders
- detail-page path builders
- paginated listing path builders
- URL slug extraction
- manifest writing helpers
- common numeric/text cleanup utilities

Do not over-generalize parser selectors until at least `shields` and `armors` confirm the DOM is actually consistent.

### 3. Shared generated output conventions

Each category should emit the same classes of generated artifacts where applicable:

- `{category}-url-manifest.json`
- `data/generated/crimsondesert-gg/{category}-rendered-listings.json`
- `data/generated/crimsondesert-gg/{category}-type-breakdown.json` or equivalent subgroup breakdown
- `data/generated/crimsondesert-gg/{category}-unique-detail-pages.json`
- `data/generated/crimsondesert-gg/{category}-count-summary.json`

If a category has no subgroup pages, skip `type-breakdown` and emit a category-specific equivalent such as `region-breakdown`, `chapter-breakdown`, or `boss-group-breakdown`.

### 4. Shared override scaffolding

Create empty override targets for future conflict resolution:

- `data/overrides/armors.json`
- `data/overrides/shields.json`
- `data/overrides/abyss-gear.json`
- `data/overrides/bosses.json`
- `data/overrides/mounts.json`
- `data/overrides/quests-main.json`
- `data/overrides/quests-faction.json`

Even if phase 1 only uses `crimsondesert.gg`, these files should exist early so the category contracts stay aligned with the documented merge strategy.

### 5. Shared tests template

For every category, mirror the weapon test shape:

- discovery tests for extracted links
- item-path tests for raw storage paths
- listing parse tests
- detail parse tests
- clean schema tests
- final data tests

This keeps regression coverage aligned with the repo's current testing style instead of waiting for multi-source merging to exist.

## Category Plans

## Shields Pipeline

### Goal

Build the second equipment pipeline using the same detail-driven model as weapons, but with defensive stats instead of attack stats.

### Expected pipeline shape

1. Crawl the shields category index on `crimsondesert.gg`.
2. Discover shield subgroup pages if the source exposes them.
3. Crawl paginated subgroup/listing pages.
4. Extract unique shield detail URLs.
5. Fetch and save each shield detail page.
6. Emit generated verification artifacts.
7. Normalize clean final records into `data/shields.json`.

### Expected final schema

Plan for a lean public schema similar to weapons:

- `id`
- `name`
- `slug`
- `category`
- `type`
- `typeLabel`
- `rarity`
- `stats.block`
- `stats.defense`
- `stats.guardEfficiency` or equivalent, if present
- `craftingMaterials[]`
- `refinement[]`
- `description`
- `source`

### Implementation notes

- Reuse the weapons pathing model if the URLs are subgroup/item based.
- Reuse refinement and material parsing if the DOM structure matches.
- Add shield-specific stat extraction instead of forcing weapon `baseDamage/finalDamage` fields onto shields.

### Risk

If shields are mixed into a broader armor/defense section instead of having their own clean subtree, discovery logic may need a category filter layer before URL manifests are written.

## Armors Pipeline

### Goal

Build an equipment pipeline for armor pieces or sets, preserving enough structure to support filtering by armor slot and rarity.

### Expected pipeline shape

1. Crawl armor index/listing pages.
2. Discover subgroup URLs such as heavy/light/set/slot pages if present.
3. Crawl paginated listing pages.
4. Extract unique armor detail URLs.
5. Fetch and save detail pages.
6. Emit verification outputs.
7. Normalize records into `data/armors.json`.

### Expected final schema

- `id`
- `name`
- `slug`
- `category`
- `slot`
- `slotLabel`
- `setName` if present
- `rarity`
- `stats.defense`
- `stats.resistances` as a flat object only if values are consistently present
- `craftingMaterials[]`
- `refinement[]`
- `description`
- `source`

### Implementation notes

- Prefer piece-level records over set-level records if detail pages are piece-specific.
- If the site exposes armor sets and individual pieces differently, normalize to piece-level JSON first and defer set aggregation to a later derived build step.
- Keep optional stats sparse rather than inventing empty placeholders for fields the source does not reliably expose.

### Risk

Armor may require slot normalization and alias mapping earlier than weapons because the source could mix helmets, chest pieces, gloves, boots, and sets with inconsistent labels.

## Abyss Gear Pipeline

### Goal

Treat abyss gear as a dedicated equipment category, even if its field shape overlaps with weapons or armor.

### Expected pipeline shape

1. Crawl abyss gear listing/index pages.
2. Discover detail URLs directly or through subgroup pages.
3. Fetch raw detail HTML.
4. Emit generated listing/detail manifests.
5. Normalize records into `data/abyss-gear.json`.

### Expected final schema

Start with the smallest stable contract:

- `id`
- `name`
- `slug`
- `category`
- `type`
- `typeLabel`
- `rarity`
- `stats`
- `specialEffects[]` if present
- `craftingMaterials[]`
- `description`
- `source`

### Implementation notes

- Do not force abyss gear into the weapon or armor schema even if there is overlap.
- Start with a category-specific schema and pull shared equipment fragments into `scripts/lib/schema.ts` only after real reuse is proven.
- Expect special effect text to matter more here than simple numeric totals.

### Risk

If abyss gear spans multiple mechanical archetypes, one flat schema may be too narrow. In that case, use a stable shared top-level shape with a category-specific `stats` object rather than splitting the category immediately.

## Bosses Pipeline

### Goal

Build a detail-driven entity pipeline for bosses, likely centered on encounter metadata and loot references instead of equipment stats.

### Expected pipeline shape

1. Crawl boss listing/index pages.
2. Discover boss detail URLs.
3. Fetch and store boss detail HTML.
4. Emit generated listing and count verification artifacts.
5. Parse boss detail pages into normalized records.
6. Write `data/bosses.json`.

### Expected final schema

- `id`
- `name`
- `slug`
- `category`
- `bossType`
- `region` or `location`
- `recommendedLevel` if present
- `drops[]`
- `description`
- `source`

### Implementation notes

- Keep drops as plain text items or simple `{ name, slug? }` records in phase 1.
- Do not block the pipeline on linking boss drops to weapon/armor IDs yet.
- If bosses have multiple encounters or phases on one page, normalize one record per boss page first and store phase detail as nested arrays only if clearly structured.

### Risk

Boss pages may include strategy prose, lore text, and loosely structured loot sections. That makes selector-level parser tests more important than equipment categories.

## Mounts Pipeline

### Goal

Build a mount entity pipeline focused on classification, acquisition method, and movement-related fields.

### Expected pipeline shape

1. Crawl mount listings.
2. Extract unique mount detail URLs.
3. Fetch raw detail pages.
4. Emit generated manifests and counts.
5. Normalize final records into `data/mounts.json`.

### Expected final schema

- `id`
- `name`
- `slug`
- `category`
- `mountType`
- `speed` or movement stats if present
- `acquisition`
- `description`
- `source`

### Implementation notes

- Keep acquisition as text in phase 1 unless the source exposes a predictable structured table.
- If movement stats are inconsistent, preserve only the fields that exist across most records.
- Do not add breeding, upgrade, or companion submodels unless the source clearly supports them.

### Risk

Mount pages may be sparse and may not justify a rich schema. The pipeline should accept a minimal contract instead of overfitting to a few outlier pages.

## Quests Pipeline

### Goal

Build two parallel quest pipelines, one for main quests and one for faction quests, while sharing parsing utilities where possible.

### Expected pipeline shape

1. Crawl the quest category landing page or pages.
2. Separate discovered URLs into `quests-main` and `quests-faction`.
3. Fetch and save detail pages by quest type.
4. Emit generated manifests and verification summaries for each quest category.
5. Normalize final records into:
   - `data/quests-main.json`
   - `data/quests-faction.json`

### Expected final schema

- `id`
- `name`
- `slug`
- `category`
- `chapter` or `questLine` if present
- `levelRequirement` if present
- `objectives[]`
- `rewards[]`
- `description`
- `source`

### Implementation notes

- Keep main and faction quests as separate final datasets because the repo schema already distinguishes `quests-main` and `quests-faction`.
- Share low-level quest parsing utilities, but keep independent normalize entry points and output files.
- Parse objectives and rewards as text-first arrays in phase 1; defer graph-style quest-chain modeling.

### Risk

Quest pages are the most likely category to need custom text parsing, section detection, and fallback logic because objectives and rewards may not be represented in the same compact card/table format used for items.

## Suggested Implementation Phases

## Phase 1: Equipment-like categories

Implement:

- `shields`
- `armors`
- `abyss-gear`

Deliverables:

- category-specific crawl scripts
- category URL manifests
- generated count summaries
- clean JSON outputs
- schema tests and detail parser tests

Success criterion:

At least three non-weapon categories prove the weapons architecture generalizes without major restructuring.

## Phase 2: Entity categories

Implement:

- `bosses`
- `mounts`

Deliverables:

- detail-driven entity schemas
- generated loot/acquisition parsing coverage
- clean `bosses.json` and `mounts.json`

Success criterion:

The pipeline supports non-equipment entities without forcing everything into item-stat assumptions.

## Phase 3: Quest categories

Implement:

- `quests-main`
- `quests-faction`

Deliverables:

- split manifests
- quest-specific parsers
- final quest JSON outputs

Success criterion:

The repo supports categories whose primary value is structured text content, not just numeric item stats.

## Recommended File Additions By Category

For each category, the minimum planned file pattern is:

- `scripts/crawl/crimsondesert-gg-{category}.ts`
- `scripts/parse/{category}-url-manifest.ts`
- `scripts/normalize/crimsondesert-gg-{category}.ts`
- `scripts/build/export-crimsondesert-gg-{category}.ts`
- `tests/{category}-manifest.test.ts`
- `tests/{category}-listing-parse.test.ts`
- `tests/{category}-detail-parse.test.ts`
- `tests/{category}-data.test.ts`

Add more focused tests like item-path or subtype-parse tests only where the category structure actually needs them.

## Non-Goals For This Plan

- multi-source merge implementation
- frontend component implementation
- detail page UI implementation
- image handling
- automated recrawl scheduling

## Recommendation

Build the next three pipelines around one principle: replicate the weapons stage boundaries exactly, but let each category own its clean schema.

That means:

- shared crawling/storage utilities where behavior is genuinely repeated
- category-specific selectors and schemas where the source content differs
- generated verification artifacts for every category before clean JSON emission

This keeps the repo coherent, makes verification cheap, and avoids prematurely abstracting categories that will almost certainly diverge once bosses and quests are added.
