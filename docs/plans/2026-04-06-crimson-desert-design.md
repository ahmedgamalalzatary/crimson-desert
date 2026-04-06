# Crimson Desert Aggregation Site Design

## Goal

Build a static English-language reference site for Crimson Desert that aggregates structured text data from:

- `crimsondesert.gg`
- `crimsondesert.th.gl`
- `game8.co/games/Crimson-Desert`

The first release covers:

- weapons
- armors
- shields
- accessories
- abyss gear
- bosses
- mounts
- quests: main and faction

The project has no backend, no images, and no admin UI. Source crawling is a one-time process. When sources conflict, source-attributed values are preserved in generated comparison data, and the final public value is selected by manually editing override files in the repository.

## Recommended Approach

Use a three-stage architecture:

1. Scrape and save raw source data.
2. Normalize and merge source records into a canonical schema with conflict tracking.
3. Generate final public JSON consumed by a static Astro frontend.

This keeps data quality concerns isolated from frontend rendering and avoids putting merge logic in the browser.

## Data Layers

### Raw source data

Saved HTML and extracted raw JSON per source for traceability and parser debugging.

### Normalized comparison data

Generated canonical records with:

- stable entity keys
- source-attributed field values
- conflict markers
- source URLs

### Final public data

Generated category JSON files that resolve conflicts by applying repository-managed override files.

## Source Processing Workflow

1. Crawl category/index pages to discover detail URLs.
2. Fetch and save raw HTML locally.
3. Parse each site with source-specific parsers.
4. Normalize records into canonical entity shapes.
5. Match duplicates across sources using deterministic keying and alias maps.
6. Detect field-level conflicts and preserve all source values.
7. Apply manual override files to select final public values.
8. Emit compact static JSON for the frontend.

## Merge Policy

Conflicting values are not silently collapsed. The generated comparison layer preserves all source values side by side with provenance. Final public values are selected manually by editing override files in code.

## Frontend Architecture

Use Astro for static generation with client-side interactivity only where needed:

- category listing pages
- detail pages
- shared search/filter/sort UI

Search is client-side. Category data stays split into separate JSON files so the browser only loads the data needed for the current section when possible.

## Planned Stack

- `Node.js`
- `TypeScript`
- `Astro`
- `Cheerio`
- `Playwright` as fallback for JS-rendered pages
- `Zod`
- `Fuse.js`
- `pnpm`

## Repository Layout

```text
docs/plans/
scripts/
  crawl/
  parse/
  normalize/
  build/
sources/
  crimsondesert-gg/
  crimsondesert-th-gl/
  game8/
data/
  generated/
  overrides/
src/
  components/
  layouts/
  pages/
  styles/
tests/
```

## Non-Goals For Initial Scope

- images
- multilingual support
- automated recurring recrawls
- login, signup, or admin tooling
- backend APIs or databases

## Immediate Implementation Plan

1. Scaffold the repository and configs.
2. Define schemas for categories and shared entity fields.
3. Create the first test-backed normalization utilities.
4. Add source-specific crawler/parser entry points.
5. Build generated-data helpers and final JSON emission.
6. Scaffold the Astro site against placeholder generated data.
