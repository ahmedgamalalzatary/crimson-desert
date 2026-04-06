# Weapons Count Verification

Date verified: 2026-04-06

## Verified Live Count

Using a live browser session against:

- `https://crimsondesert.gg/database/weapons`

The page rendered:

- `433`
- `Browse all 433 weapons in Crimson Desert with full stats and how to obtain each one.`
- `All Types (433)`

## Extraction Findings

Current extraction state from the repo:

- `30` weapon type pages discovered
- `400` unique weapon detail-page URLs discovered

## Why Counts Differ

The site-level listing count is not the same as the unique detail-page count.

Examples:

- `one-hand-fist` renders `5` listing entries but only `3` unique hrefs because `Ordinary Gloves` appears once per character while linking to the same detail page
- `two-hand-pike` renders `82` listing entries but fewer unique hrefs because several banner-pike cards repeat the same detail page with different displayed values

## Conclusion

Both numbers are real, but they describe different things:

- `433` = rendered listing entries on the live source page
- `400` = unique detail-page URLs extracted so far

For generated JSON, both datasets should be preserved separately.
