# SMACNA Rectangular Duct Material Takeoff — PWA

## Source file analysis

`ME_DUCT_SMACNA.xls` (sheet `Duct_SMACNA`) contained no calculation logic —
just column headers (Run, Type, Width, Depth, Length, Perimeter, Area, gauge
columns, then Insulation through Washers) and a duct-size-to-gauge reference
table. No formulas, no filled rows. Everything in `src/lib/smacnaDuctCalc.ts`
was built fresh, not migrated.

## What's confirmed vs. assumed

| Item | Status |
|---|---|
| Perimeter = 2×(W+D)/1000, Area = Perimeter×Length | Plain geometry, no assumption |
| Gauge bands (≤300 / 325–450 / 775–1350 / 1375–2100 / 2115–3050mm) | Taken directly from the source workbook |
| 451–774mm gauge gap | **Unresolved in the source file.** Defaults to Ga22 (heavier/safer side). Flagged in the UI (Reference tab, and a warning banner on affected rows). Confirm against your SMACNA edition and pressure class — the source table doesn't state a pressure class, and gauge selection normally depends on both dimension and pressure class. |
| Above 3050mm | Not covered by the source table — treated as "needs manual review," not auto-assigned a gauge |
| All material takeoff rates (insulation, sealant, adhesive, duct pin, tape, strap, corner, angle, rod, cnc insert, nuts, washers) | **All placeholder assumptions.** None existed in the source file. Every rate lives in one place — `MATERIAL_RATES` in `src/lib/smacnaDuctCalc.ts` — with an inline comment on each. Edit there once you confirm your own estimating rates; the whole app recalculates from that one source. |
| "Corner" column unit | Source template lists it in "sq m," unusual for what's normally a piece-count item. Preserved as-is rather than silently changed — see the note in the Reference tab. |

## Architecture

- `src/lib/smacnaDuctCalc.ts` — pure calculation engine, no UI dependency, so it's testable on its own (sanity-checked with sample runs including a gap-range case before the UI was built).
- `src/components/RunInputTable.tsx` — input section (Run/Type/Width/Depth/Length).
- `src/components/ResultsTable.tsx` — computed geometry, gauge, materials per run + totals.
- `src/components/ReferenceTab.tsx` — source gauge table + editable-rate reference, matching your suite's existing Reference-tab convention.
- `src/App.tsx` — tab nav, state, install-prompt handling, Save-as-PDF (print CSS).
- Styling in `src/App.css` follows your established visual language: yellow section headers with numbered blue badges, formula/legend boxes, boxed results, red warning / green OK indicators, sticky nav.

## Tech stack

React + TypeScript + Vite, `vite-plugin-pwa` for the manifest and service worker (`generateSW` mode, precaches all built assets for offline use).

## PWA / install

- `npm run build` generates `dist/manifest.webmanifest`, `dist/sw.js`, and `dist/workbox-*.js` — verified in this build.
- Icons in `public/icons/` (192, 512, apple-touch-icon) — simple placeholder branding in your navy/yellow palette; swap these for your own artwork if you have it.
- **Windows (Chrome/Edge):** serve `dist/` (e.g. `npm run preview` or any static host), open it, click the install icon in the address bar (or the in-app "Install App" banner).
- **Android:** open the hosted URL in Chrome, use "Add to Home screen" (or the in-app banner) — launches standalone with the app icon.
- Offline: once loaded once, the calculator, all inputs, and the reference tab work with no network — nothing in this tool depends on live data.

## What's still open (needs your input, not mine)

1. Confirm the 451–774mm gauge default and the pressure class this table assumes.
2. Confirm or replace every rate in `MATERIAL_RATES` — these are the biggest unknowns since the source file had nothing to migrate.
3. Decide if "Corner" should actually be a piece count rather than sq m.

## Testing performed

- `tsc --noEmit` — no type errors.
- `npm run build` — production build succeeds; manifest and service worker generated correctly.
- Manual calculation sanity check (3 sample runs, including one in the unresolved gauge gap) confirmed perimeter, area, gauge flagging, and material math all compute as expected before the UI was wired up.
- Not yet done: in-browser install/offline testing (needs a real device/browser session on your end), and no regression comparison against an original HTML calculator exists since none was provided — the "original vs. migrated" comparison in the master prompt doesn't apply here for that reason.

## Local development

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # serve the production build locally to test PWA install
```
