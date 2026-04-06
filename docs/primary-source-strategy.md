# Primary Source Strategy

## Decision

As of 2026-04-06, the project will treat `crimsondesert.gg` as the primary data source for the first extraction phase.

## Why

- The site already exposes a broad database structure.
- The weapons section is crawlable in a predictable two-level hierarchy.
- The current crawl discovered:
  - 30 weapon type pages
  - 400 weapon item URLs
- That is already close to the expected total weapon volume and is enough to establish the canonical extraction pipeline before comparing with secondary sources.

## Working Rule

Phase 1 focuses on:

1. crawling `crimsondesert.gg`
2. extracting normalized records from it
3. building stable IDs and schemas from that source

Only after the primary-source pipeline is stable do we expand comparison work against:

- `crimsondesert.th.gl`
- `game8.co/games/Crimson-Desert`

## Practical Implication

- secondary sources stay in the project model
- active implementation prioritizes `crimsondesert.gg`
- merge and conflict handling remain part of the architecture, but they are not the current bottleneck


# Overrides

Manual conflict resolution files live here.

Guidelines:

- do not edit generated data
- edit only override files
- keep keys stable
- choose one public value per conflicting field

Planned files:

- `weapons.json`
- `armors.json`
- `shields.json`
- `accessories.json`
- `abyss-gear.json`
- `bosses.json`
- `mounts.json`
- `quests-main.json`
- `quests-faction.json`

