# Repo Structure

## Authored Files

These are the files that should be treated as source-of-truth and read carefully.

- `docs/`
- `scripts/`
- `src/`
- `tests/`
- root config files such as `package.json`, `tsconfig.json`, `astro.config.mjs`, `vitest.config.ts`, `.gitignore`

## Generated Files

These are outputs, caches, or rebuildable artifacts.

- `sources/`
  Saved raw HTML fetched from source websites.
- `data/generated/`
  Intermediate extraction outputs, manifests, summaries, and debug JSON.
- `dist/`
  Static site build output.
- `node_modules/`
  Dependency install output.

## Clean Website Data

These files are generated, but they are intended to be human-readable and directly consumed by the website.

- `data/weapons.json`

This is the current final cleaned dataset for the weapons category. It is generated from the saved `crimsondesert.gg` item pages and is the file the Astro weapons page reads.

## Current Weapon Flow

1. `sources/crimsondesert-gg/weapons/...`
   Raw fetched HTML pages
2. `data/generated/crimsondesert-gg/...`
   Crawl manifests and verification JSON
3. `data/weapons.json`
   Clean normalized website data
4. `src/pages/weapons/index.astro`
   Static weapons page wired to the clean JSON
