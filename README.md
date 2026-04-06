# Crimson Desert

Static reference site and data pipeline for aggregating Crimson Desert game data from multiple public sources.

## Scope

Current categories:

- weapons
- armors
- shields
- accessories
- abyss gear
- bosses
- mounts
- quests: main and faction

## Architecture

- `scripts/`: crawling, parsing, normalization, and data generation
- `sources/`: raw source payloads
- `data/`: generated data and manual overrides
- `src/`: Astro frontend
- `tests/`: test coverage for schema and data logic

## Planned Commands

- `pnpm install`
- `pnpm test`
- `pnpm data:build`
- `pnpm dev`
- `pnpm build`

## Notes

The public site consumes generated final JSON. Source conflicts are preserved during normalization and resolved by repository-managed override files.
