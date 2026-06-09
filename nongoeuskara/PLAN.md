# Nongoeuskara — Implementation Plan

## Concept

A completely new UX for Basque dialect identification. Instead of card-based results,
the user sees a map of **Euskal Herria** with **430 Basque towns/villages** and
7 provincial boundaries. As they type Basque text, the azpieuskalki model runs in
the browser and highlights the predicted towns/regions on the map in real time —
a heatmap of dialect geography.

**URL:** `itzune.eus/euskalkid/nongoeuskara/`

---

## Current Status

### ✅ Done

#### Map SVG — Mapped to 12 tier-3 model labels
The original Wiki Commons SVG (`Euskal_Herria_euskalkiak2.svg`) has been remapped
to match our 12 tier-3 azpieuskalki model output classes. The remapping script
(`regenerate_map.py`) adds `data-model-label` attributes to SVG `<g>` and `<path>`
elements by matching municipality names against the Ahotsak.eus town→azpieuskalki
assignment database.

- **73 paths** get precise per-town model labels (from Ahotsak town name matching)
- **1,498 paths** inherit layer-level default model labels
- All 12 model labels are represented as legend items with distinct colors
- `map_original.svg` preserved as reference backup (1.2 MB, unmodified Wiki Commons source)

#### Render pipeline
- SVG loaded via `fetch()` + `DOMParser` (preserves Inkscape namespaces correctly)
- **Default state:** all 1,571 municipality paths in uniform muted grey (`#d0d5da`)
- **Hover/click:** highlights all paths sharing the same `data-model-label` with the zone's accent color
- **Tooltips:** show municipality name + dialect zone on hover (281 named towns supported, including nested `<g>` groups like Berrioplano)
- **Legend:** 12 clickable color swatches, one per model label, to pin a zone
- **Programmatic API:** `window.euskalkid.highlightLabel("mendebal-sartaldea")` / `clearHighlight()` for model integration

#### Theme support
- Light/dark modes via `src/theme.js` (detects `prefers-color-scheme`, stores override in `localStorage`)
- Map colors remain consistent across themes (the grey-out + accent highlight scheme works in both)

### ⚠️ Known limitations

#### SVG layer granularity
Some SVG layers map to multiple model labels, but the original polygons lack per-municipality names:

| SVG Layer | Paths | Named | Model labels | Resolution |
|---|---|---|---|---|
| Mendebalde | 435 | 0 | `mendebal-sartaldea` + `mendebal-sortaldea` | All map to `mendebal-sartaldea` |
| Erdialde | 220 | 11 | `erdialde-sartaldea` + `erdialde-sortaldea` | 8 paths have `erdialde-sortaldea`; rest default to `erdialde-sartaldea` |
| Zuberoa | 36 | 0 | `zuberera` | All map to `zuberera` (correct, just not per-town) |
| Nafarroa Beherea | 102 | 1 | `naflap-sortaldea` | Only Luzaide/Valcarlos matched |

When the model predicts a label that matches only a region-within-a-layer
(e.g., `mendebal-sortaldea`), we can only highlight the full parent layer for now.

### 🔜 Remaining

#### Phase 2: Wire Model
- [ ] Add `nongoeuskara/index.html` entry to `vite.config.js` (✅ done)
- [ ] Load the azpieuskalki fastText WASM model
- [ ] Add textarea for Basque text input
- [ ] Implement debounced prediction on textarea input
- [ ] Map model output probabilities to `highlightLabel()` calls
- [ ] Show per-class predictions in sidebar/panel

#### Phase 3: Polish
- [ ] Click-to-pin zones (✅ done in legend)
- [ ] Share button (copy URL with text?)
- [ ] Responsive layout (mobile-first: map below textarea)
- [ ] Smooth CSS transitions on highlight
- [ ] Accessibility (keyboard nav, ARIA labels)

#### Phase 4: Integration
- [ ] Add to main site navigation (link from index/azpieuskalki pages)
- [ ] Build & deploy to GitHub Pages
- [ ] Cross-browser testing

---

## Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Map rendering | **Inline SVG** (remapped Wiki Commons) | 1,571 municipality paths with `data-model-label` — no external dependencies |
| Framework | **Vanilla JS** (like `index.html` / `azpieuskalki.html`) | Consistent with existing stack |
| Model runtime | `fasttext.wasm.js` (existing) | Reuse the azpieuskalki 31MB WASM model |
| Styling | CSS custom properties + theme.js | Reuse the existing light/dark theme system |
| Build | Vite (existing) | `nongoeuskara/index.html` added as build entry in `vite.config.js` |

---

## Data: Azpieuskalki Model Labels → SVG Layer Mapping

The `Euskal_Herria_euskalkiak2.svg` from Wikimedia Commons contains **1,571
municipality-level SVG paths** grouped into **12 dialect zone layers** following
Louis Luziano Bonaparte's classification (also used by Zuazo and Ahotsak.eus).

### 12 tier-3 model labels with SVG coverage

| Model Label | Display Name | Color | SVG Layers | Named Paths | Total Paths |
|---|---|---|---|---|---|
| `mendebal-sartaldea` | Mendebal-sartaldea | `#8b5cf6` | Mendebalde (all) | 0 | 435 |
| `mendebal-sortaldea` | Mendebal-sortaldea | `#7c3aed` | — (merged into sartaldea) | — | — |
| `erdialde-sartaldea` | Erdialde-sartaldea | `#06b6d4` | Erdialde (default) | — | 220 |
| `erdialde-sortaldea` | Erdialde-sortaldea | `#0ea5e9` | Erdialde (eastern towns) | 8 | — |
| `nafar-ipar-sartaldea` | Nafar ipar-sartaldea | `#f59e0b` | Ipar. Naf. Garaia (Bortziriak/Malerreka) | 17 | 115 |
| `nafar-erdigunea` | Nafar erdigunea | `#10b981` | Heg. Naf. Garaia + Ipar. Naf. Garaia (central) | 9 | 375+ |
| `nafar-hego-sartaldea` | Nafar hego-sartaldea | `#84cc16` | Burunda (Sakana) | 5 | 200 |
| `nafar-sortaldea` | Nafar sortaldea | `#f97316` | Aezkoa + Baztan + Heg. Naf. (east) | 12 | 20+2+ |
| `naflap-sartaldea` | Naf-lapur sartaldea | `#ec4899` | Lapurdi | 3 | 24 |
| `naflap-sortaldea` | Naf-lapur sortaldea | `#d946ef` | Nafarroa Beherea | 1 | 102 |
| `zuberera` | Zuberera | `#14b8a6` | Zuberoa | 0 | 36 |
| `ekialde-nafarra` | Ekialdeko nafarra | `#ef4444` | Zaraitzu + Erronkari | 12 | 28+14 |

### Ahotsak → Model label mapping (used in regenerate_map.py)

```
Ahotsak azpieuskalki (19 classes)       →  Our training label (12 classes)
────────────────────────────────────────────────────────────────────────
sartaldekoa-m                           →  mendebal-sartaldea
sortaldekoa-m + tartekoa-m              →  mendebal-sortaldea
erdigunekoa-g + sartaldekoa-g           →  erdialde-sartaldea
sortaldekoa-g                           →  erdialde-sortaldea
ipar-sartaldekoa                        →  nafar-ipar-sartaldea
erdigunekoa-n + hegoaldeko-nafarra      →  nafar-erdigunea
hego-sartaldekoa                        →  nafar-hego-sartaldea
sortaldekoa-n + baztangoa               →  nafar-sortaldea
sartaldekoa-nl + erdigunekoa-nl         →  naflap-sartaldea
sortaldekoa-nl                          →  naflap-sortaldea
basaburua + pettarrakoa                 →  zuberera
zaraitzukoa + erronkarikoa              →  ekialde-nafarra
```

### Key advantage

No GeoJSON needed. No geocoding needed. No external API calls. The SVG already
has municipality-level paths grouped by dialect zone — we enhanced it with
`data-model-label` attributes matching our exact model output classes. JavaScript
simply queries `[data-model-label="zuberera"]` to highlight all relevant paths.

---

## UI Design

### Layout (desktop)
```
┌──────────────────────────────────────────┐
│  [☀/🌙]  Nongoeuskara                    │  ← header
│          Non dago euskara hau?            │
├──────────────────────┬───────────────────┤
│                      │                   │
│    MAP               │  TEXT AREA        │
│    (Euskal Herria    │  ┌─────────────┐  │
│     7 herrialde)     │  │ idatzi...   │  │
│                      │  │             │  │
│   provinces glow     │  │             │  │
│   based on model     │  │             │  │
│   confidence         │  │             │  │
│                      │  └─────────────┘  │
│                      │                   │
│                      │  PREDICTIONS      │
│                      │  ▸ Mendebal-      │
│                      │    sartaldea 78%  │
│                      │  ▸ ...            │
│                      │                   │
├──────────────────────┴───────────────────┤
│  Footer: links, 31MB, MIT               │
└──────────────────────────────────────────┘
```

### Layout (mobile)
```
┌──────────────────────┐
│  Nongoeuskara    [☀] │
├──────────────────────┤
│  ┌────────────────┐  │
│  │ idatzi hemen...│  │  ← text area first
│  └────────────────┘  │
│                      │
│  ▸ Mendebal-sart.78% │
│  ▸ ...               │
│                      │
│  ┌────────────────┐  │
│  │                │  │
│  │    MAP         │  │  ← map below
│  │                │  │
│  └────────────────┘  │
├──────────────────────┤
│  Footer              │
└──────────────────────┘
```

### Map Design

The map is the **remapped Wiki Commons SVG** (`map.svg`) embedded inline and
controlled via JavaScript/CSS:

- **Default state:** All 1,571 municipality paths in muted grey (`#d0d5da`)
- **Highlighted state:** Paths with matching `data-model-label` get zone accent color at 85% opacity
- **Tooltip on hover:** Municipality name + zone label
- **Legend:** 12 clickable color swatches, one per model label
- **Animation:** Planned CSS `transition: fill 300ms ease-out`
- **Responsive:** SVG `viewBox` handles scaling; inline via DOMParser

---

## Interaction Flow

1. User opens page → map shows neutral grey state
2. User types/pastes Basque text in the textarea
3. On each keystroke (debounced 300ms):
   a. Text is sent to the azpieuskalki WASM model
   b. Model returns probability distribution over 12 classes
   c. Top label calls `window.euskalkid.highlightLabel(label)`
   d. Top-3 predictions shown in the results panel with confidence percentages
4. Clicking a legend item → pins the zone (freezes highlight)
5. Clicking again or clearing text → back to neutral state

---

## File Structure

```
nongoeuskara/
├── PLAN.md                ← this file
├── index.html             ← main page (Vite entry point)
├── map.svg                ← remapped SVG with data-model-label attributes (1.2 MB)
├── map_original.svg       ← original Wiki Commons SVG (backup, 1.2 MB)
├── regenerate_map.py      ← Python script to add model labels to SVG
├── src/
│   └── map.js             ← map rendering, zone highlighting, legend, tooltips
└── data/
    └── (future) predictions or province mappings
```

---

## Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| `fasttext.wasm.js` | ML inference | (existing, 31MB WASM for azpieuskalki) |

No additional libraries needed. The SVG is fetched at runtime and manipulated
via standard DOM API.

---

## References

- Azpieuskalki map data: `zeineuski/src/data/azpieuskalki_map.py`
- Ahotsak town assignments: `zeineuski/data/reference/ahotsak_azpieuskalki_towns.json` (430 towns, 19 Ahotsak labels)
- Existing WASM model: `euskalkid/node_modules/fasttext.wasm.js/`
- Theme system: `euskalkid/src/theme.js`
- Vite config: `euskalkid/vite.config.js`
- Original SVG: Wikimedia Commons `Euskal_Herria_euskalkiak2.svg`
