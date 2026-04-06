# Project Context

## Goal

Build a static Crimson Desert reference website that aggregates public game data into one place.

## Current Source Plan

Primary source for the current extraction phase:

- `crimsondesert.gg`

Secondary comparison sources for later phases:

- `crimsondesert.th.gl`
- `game8.co/games/Crimson-Desert`

## Current Categories

- weapons
- armors
- shields
- accessories
- abyss gear
- bosses
- mounts
- quests: main
- quests: faction

## Product Constraints

- no backend
- no images for now
- data is public
- static-site delivery
- search, filtering, and sorting are required
- owner conflict resolution happens by editing code and data files, not with a separate admin UI

## Data Strategy

Planned architecture:

1. crawl source pages
2. save raw HTML locally
3. parse and normalize data
4. write generated JSON files
5. build the static frontend from generated JSON

## Current Narrowed Strategy

The current implementation phase is intentionally narrowed to `crimsondesert.gg` first.

Reason:

- it behaves like the strongest single source
- it already exposes enough structured database pages to prove the pipeline
- comparison against other sites should happen after the primary-source extraction is stable

## Weapons Count Status

Verified on 2026-04-06:

- the live `https://crimsondesert.gg/database/weapons` page states `433` weapons
- the current unique discovered detail-page URL count is `400`

This difference exists because the website's visible listing count includes repeated rendered entries for some item pages, such as:

- character variants
- repeated banner-pike entries that resolve to the same detail URL

So there are two valid numbers with different meanings:

- `433`: rendered listing entries on the live weapons page
- `400`: unique detail-page URLs currently extracted from the source

## Current Generated Data Targets

The repo now targets these generated JSON outputs for the weapons phase:

- rendered listing entries from `crimsondesert.gg`
- unique discovered detail URLs from `crimsondesert.gg`
- count verification summary

## Important Working Rule

When a future chat starts, this repo documentation should be enough context to continue without re-explaining:

- sources
- categories
- constraints
- current strategy
- verified counts
- current extraction status
