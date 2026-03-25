# Tasks: 3D Living Room Model Showcase

**Input**: Design documents from `/specs/001-3d-model-showcase/`
**Prerequisites**: [plan.md](plan.md) · [spec.md](spec.md) · [research.md](research.md) · [data-model.md](data-model.md) · [contracts/component-contracts.md](contracts/component-contracts.md)
**Branch**: `001-3d-model-showcase`

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[US1/US2/US3]**: Which user story this task belongs to
- All paths are relative to the repository root

---

## Phase 1: Setup

**Purpose**: Bootstrap the Next.js 15 project and configure all tooling. No feature code yet — just a working, runnable skeleton.

- [X] T001 Initialize Next.js 15 App Router TypeScript project with pnpm (`pnpm dlx create-next-app@latest . --typescript --app --src-dir --no-tailwind --eslint`)
- [X] T002 Install `@google/model-viewer` and test tooling dependencies (`pnpm add @google/model-viewer` · `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test`)
- [X] T003 [P] Configure `next.config.ts` — set `output: 'export'` and `images: { unoptimized: true }` in `next.config.ts`
- [X] T004 [P] Configure TypeScript strict mode — set `"strict": true` in `tsconfig.json`
- [X] T005 [P] Configure Vitest — create `vitest.config.ts` with React plugin, jsdom environment, and `@testing-library/jest-dom` setup file
- [X] T006 [P] Configure Playwright — create `playwright.config.ts` targeting `http://localhost:3000`, desktop Chromium only

**Checkpoint**: `pnpm dev` starts without errors. `pnpm build` outputs static files to `./out/`.

---

## Phase 2: Foundational

**Purpose**: Shared types, static data configs, and the app shell that ALL three user stories depend on. Must be complete before any user story phase begins.

**⚠️ CRITICAL**: User story implementation cannot start until this phase is complete.

- [X] T007 Create shared TypeScript interfaces in `src/types/index.ts` — export `ChairModel`, `ColorOption`, `MaterialPreset` interfaces (source: [contracts/component-contracts.md](contracts/component-contracts.md))
- [X] T008 [P] Create model-viewer JSX type declaration in `src/types/model-viewer.d.ts` — extend `JSX.IntrinsicElements` with `model-viewer` element props (`src`, `alt`, `camera-controls`, `environment-image`, `camera-orbit`, `slot`, `onError`, `onLoad`, `onProgress`)
- [X] T009 [P] Create static config `src/data/chairModel.ts` — export `CHAIR_MODEL: ChairModel` with `src: '/models/chair.glb'`, `initialCameraOrbit: '0deg 75deg 2.5m'` (source: [data-model.md](data-model.md))
- [X] T010 [P] Create static config `src/data/colorOptions.ts` — export `COLOR_OPTIONS: ColorOption[]` with 4 options: Ivory `#f5f0e8`, Charcoal `#3d3d3d`, Dusty Rose `#c48b9f`, Sage Green `#87a96b`; first item `isActive: true`
- [X] T011 [P] Create static config `src/data/materialPresets.ts` — export `MATERIAL_PRESETS: MaterialPreset[]` with 3 presets: Cream Leather (roughness 0.3, metalness 0.0), Blue Velvet (roughness 0.9, metalness 0.0), Walnut Wood (roughness 0.6, metalness 0.0); first item `isActive: true`
- [X] T012 Create `src/app/globals.css` — define CSS custom properties for spacing, colors, font, radius, and z-index tokens used across all CSS Modules
- [X] T013 Create `src/app/layout.tsx` — root server layout with `<html lang="en">`, metadata (`title: '3D Chair Showcase'`, `description`, `viewport`), and import of `globals.css`

**Checkpoint**: `pnpm build` succeeds. TypeScript reports no errors (`pnpm tsc --noEmit`). Types and data configs are importable.

---

## Phase 3: User Story 1 — View 3D Chair in the Browser (Priority: P1) 🎯 MVP

**Goal**: A visitor opens the page and sees a fully interactive 3D chair rendered with HDR lighting. They can rotate, zoom, and pan. A loading indicator appears while fetching the GLB. An error message appears if loading fails. A "Reset view" button restores the default camera.

**Independent Test**: Open the app in Chrome. A 3D chair appears. Drag to rotate — chair rotates smoothly. Scroll to zoom. Click "Reset view" — camera returns to default. Disable network and reload — an error message appears instead of a blank screen.

**FRs covered**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-013, FR-015, FR-016, FR-017, FR-018

### Implementation

- [X] T014 [US1] Create `src/components/Header/Header.tsx` — server component; renders `<header>` with brand name "3D Chair Showcase" and a site logo placeholder; export `Header` (FR-015)
- [X] T015 [P] [US1] Create `src/components/Header/Header.module.css` — styles for header bar, logo, brand name
- [X] T016 [P] [US1] Create `src/components/ResetViewButton/ResetViewButton.tsx` — `<button>` with `aria-label="Reset camera view"`, calls `onReset` prop on click (FR-018); export `ResetViewButton`
- [X] T017 [P] [US1] Create `src/components/ResetViewButton/ResetViewButton.module.css` — button styles
- [X] T018 [US1] Create `src/components/ModelViewerWrapper/ModelViewerWrapper.tsx` — `'use client'`; renders `<model-viewer camera-controls environment-image="neutral" ...>` with: `[slot="progress"]` loading spinner (FR-005); `onError` handler that calls `onError` prop (FR-006); `useEffect` watching `activeColor` → calls `material.pbrMetallicRoughness.setBaseColorFactor(hex)` on primary material; `useEffect` watching `activeMaterial` → applies roughness/metalness/texture then re-applies `activeColor`; `useEffect` watching `resetTrigger` → restores `viewer.cameraOrbit` and calls `viewer.jumpCameraToGoal()` (FR-018); uses `ModelViewerWrapperProps` from contracts (`src`, `alt`, `initialCameraOrbit`, `onLoad`, `onError`, `activeColor`, `activeMaterial`, `resetTrigger`) (FR-001–FR-004, FR-017)
- [X] T019 [P] [US1] Create `src/components/ModelViewerWrapper/ModelViewerWrapper.module.css` — viewer container styles, loading overlay, error message panel
- [X] T020 [US1] Create `src/components/ShowcasePage/ShowcasePage.tsx` — `'use client'`; dynamically imports `ModelViewerWrapper` via `dynamic(() => import('../ModelViewerWrapper/ModelViewerWrapper'), { ssr: false })`; manages `activeColorId` (init from first `COLOR_OPTIONS` item), `activeMaterialId` (init from first `MATERIAL_PRESETS` item), `resetTrigger` (number, init 0), `isLoading`, `hasError` state; renders `<Header>`, viewer area, controls area (empty placeholder for US2/US3), `<ResetViewButton>` adjacent to viewer; layout satisfies FR-016 (all controls visible without scroll at ≥1024px)
- [X] T021 [P] [US1] Create `src/components/ShowcasePage/ShowcasePage.module.css` — CSS Grid/Flexbox layout: header full width, viewer left column, controls right column, minimum 1024px wide
- [X] T022 [US1] Create `src/app/page.tsx` — server component that imports and renders `<ShowcasePage />`; no props needed (data loaded inside ShowcasePage from static configs)
- [X] T023 [US1] Create placeholder asset directories — `public/models/.gitkeep` and `public/textures/.gitkeep` so the folder structure exists; add a note in `public/models/README.md` that `chair.glb` must be placed here before running

**Checkpoint**: `pnpm dev` → open `http://localhost:3000` → grey model-viewer placeholder visible (no GLB yet, but no crash). Place any GLB at `public/models/chair.glb` → model renders and rotates. Reset view button is visible and clickable.

---

## Phase 4: User Story 2 — Change Chair Color (Priority: P2)

**Goal**: A color palette with ≥ 4 swatches appears next to the viewer. Clicking a swatch updates the chair surface color in real time (≤ 500 ms). The active swatch is visually marked. Selecting a new color does not reset the current material preset.

**Independent Test**: US1 must be working. Click each color swatch in sequence. After each click the chair color visibly changes to match. The active swatch has a visible ring. Click a material, then click a color — material is unchanged. Click a color, then click a material — the color tint stays.

**FRs covered**: FR-007, FR-008, FR-011, FR-012

### Implementation

- [ ] T024 [US2] Create `src/components/ColorPicker/ColorSwatch.tsx` — `<button>` element; background set to `option.hex`; `aria-label={option.label}`; `aria-pressed={option.isActive}`; active state shows a ring/border, inactive does not; calls `onSelect(option.id)` on click; uses `ColorSwatchProps` interface
- [ ] T025 [P] [US2] Create `src/components/ColorPicker/ColorPicker.tsx` and `ColorPicker.module.css` — renders a row of `<ColorSwatch>` per `options` entry; section label "Color"; calls `onSelect` forwarded from `ColorPickerProps`; uses `ColorPickerProps` interface
- [ ] T026 [US2] Update `src/components/ShowcasePage/ShowcasePage.tsx` — add `handleColorSelect(id: string)` that updates `activeColorId` state; derive `activeColorHex` from `COLOR_OPTIONS`; render `<ColorPicker options={colorOptionsWithActiveState} onSelect={handleColorSelect} />` in the controls area; pass `activeColor={activeColorHex}` to `ModelViewerWrapper`
- [ ] T027 [US2] Verify `activeColor` `useEffect` in `src/components/ModelViewerWrapper/ModelViewerWrapper.tsx` applies `setBaseColorFactor` correctly — confirm composition: after material swap, `activeColor` is re-applied (FR-011 compliance); add `@ts-expect-error` guard for model-viewer Element casting if needed

**Checkpoint**: Color swatches visible; clicking each swatch changes the chair color. Active swatch shows visual ring. Switching material and then clicking a color swatch still changes color without resetting material.

---

## Phase 5: User Story 3 — Change Chair Material Preset (Priority: P3)

**Goal**: A material panel with ≥ 3 named presets (thumbnail + label) appears in the controls area. Selecting a preset replaces the chair's full PBR surface (texture, roughness, metalness) within 500 ms. Selecting a color swatch afterwards tints the material base color without resetting roughness/metalness.

**Independent Test**: US1 and US2 must be working. Click each material preset — chair surface visibly changes (sheen, roughness, pattern). Click a color swatch after changing material — color applies without resetting PBR properties. Rotate and zoom — no visual glitches.

**FRs covered**: FR-009, FR-010, FR-011, FR-012

### Implementation

- [ ] T028 [US3] Create `src/components/MaterialSelector/MaterialThumbnail.tsx` — `<button>` element; contains `<img>` from `preset.thumbnail` and `<span>` with `preset.label`; `aria-label={preset.label}`; `aria-pressed={preset.isActive}`; active state shows ring/border; calls `onSelect(preset.id)` on click; uses `MaterialThumbnailProps` interface
- [ ] T029 [P] [US3] Create `src/components/MaterialSelector/MaterialSelector.tsx` and `MaterialSelector.module.css` — renders a column of `<MaterialThumbnail>` per `presets` entry; section label "Material"; uses `MaterialSelectorProps` interface
- [ ] T030 [US3] Update `src/components/ShowcasePage/ShowcasePage.tsx` — add `handleMaterialSelect(id: string)` that updates `activeMaterialId` state; derive `activeMaterial: MaterialPreset` from `MATERIAL_PRESETS`; render `<MaterialSelector presets={materialPresetsWithActiveState} onSelect={handleMaterialSelect} />` in the controls area; pass `activeMaterial={activeMaterial}` to `ModelViewerWrapper`
- [ ] T031 [US3] Verify `activeMaterial` `useEffect` in `src/components/ModelViewerWrapper/ModelViewerWrapper.tsx` — confirm it applies roughness via `setRoughnessFactor`, metalness via `setMetallicFactor`, texture via `viewer.createTexture(url)` → `material.pbrMetallicRoughness.setBaseColorTexture(texture)`, then re-applies current `activeColor` via `setBaseColorFactor` immediately after (FR-011 no cross-reset)

**Checkpoint**: All 3 user stories work together end-to-end. Switching colors and materials in any order composes correctly. No visual corruption during rapid switching.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Constitution-mandated test coverage, accessibility audit, and final validation run. Affects multiple user stories.

- [ ] T032 [P] Create `tests/unit/colorOptions.test.ts` — Vitest tests: (1) `COLOR_OPTIONS` has ≥ 4 items, (2) exactly one item has `isActive === true`, (3) all `hex` values match `/^#[0-9a-fA-F]{3,6}$/`, (4) all `id` values are unique and kebab-case
- [ ] T033 [P] Create `tests/unit/materialPresets.test.ts` — Vitest tests: (1) `MATERIAL_PRESETS` has ≥ 3 items, (2) exactly one item has `isActive === true`, (3) all `roughness` and `metalness` are within `[0, 1]`, (4) all `thumbnail` paths start with `/textures/`, (5) all `id` values are unique
- [ ] T034 Create `tests/e2e/showcase.spec.ts` — Playwright E2E tests for US1: (1) page loads and `<model-viewer>` is present in DOM, (2) after `load` event, model is visible (check aria attributes), (3) "Reset view" button is visible and has accessible label, (4) clicking Reset view does not throw
- [ ] T035 [P] Extend `tests/e2e/showcase.spec.ts` — add Playwright E2E tests for US2: (1) 4 color swatch buttons present, (2) clicking a swatch gives it `aria-pressed="true"` and previous loses it; and for US3: (1) 3 material thumbnail buttons present, (2) clicking a thumbnail gives it `aria-pressed="true"` and previous loses it
- [ ] T036 [P] Accessibility audit — review all interactive components (`ColorSwatch`, `MaterialThumbnail`, `ResetViewButton`) for `aria-label`, `aria-pressed`, keyboard focus styles, and minimum 44×44 px touch target; fix any gaps in-place
- [ ] T037 Run quickstart.md validation checklist — follow all steps in [quickstart.md](quickstart.md) in a clean terminal, confirm every manual verification item passes; fix any discrepancies found

**Checkpoint**: `pnpm test` (Vitest) exits 0. `pnpm test:e2e` (Playwright) exits 0. `pnpm build` outputs clean static bundle. quickstart.md checklist fully passes.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    └── Phase 2 (Foundational) — depends on Phase 1
            ├── Phase 3 (US1 — P1) ← BLOCKS US2 and US3
            │       └── Phase 4 (US2 — P2) — can start after Phase 3 checkpoint
            │               └── Phase 5 (US3 — P3) — can start after Phase 4 checkpoint
            │                       └── Phase 6 (Polish) — all stories must be complete
            └── (alternatively: US2 and US3 can start in parallel after Phase 3 if team staffing allows)
```

### User Story Dependencies

| Story | Depends On | Independently Testable? |
|-------|-----------|------------------------|
| US1 (P1) — View 3D Chair | Phase 2 complete | Yes — open page, see model |
| US2 (P2) — Change Color | US1 complete (ModelViewerWrapper exists) | Yes — click swatches, see color change |
| US3 (P3) — Change Material | US1 complete (ModelViewerWrapper exists) | Yes — click presets, see material change |

*US2 and US3 both extend ModelViewerWrapper but are independent of each other — they can be parallelized after US1 is done.*

### Within Each User Story

- Types and data configs (Phase 2) before any component
- `ModelViewerWrapper` before `ShowcasePage` (Phase 3)
- `ShowcasePage` shell before `page.tsx` (Phase 3)
- Leaf components (`ColorSwatch`, `MaterialThumbnail`) before their parent containers
- Implementation before E2E tests (Polish phase)
- Unit tests (T032/T033) are independent of implementation — can run in parallel with Phase 3

---

## Parallel Opportunities

### Phase 1 — Parallel setup tasks

```
T001 (create-next-app)
    ├── T003 [P] next.config.ts
    ├── T004 [P] tsconfig.json
    ├── T005 [P] vitest.config.ts
    └── T006 [P] playwright.config.ts
```

### Phase 2 — Parallel foundational tasks (after T007)

```
T007 (types/index.ts)
    ├── T008 [P] types/model-viewer.d.ts
    ├── T009 [P] data/chairModel.ts
    ├── T010 [P] data/colorOptions.ts
    └── T011 [P] data/materialPresets.ts
```

### Phase 3 — Partial parallelism within US1

```
T014 (Header.tsx)                 ← T015 [P] Header.module.css
T016 [P] (ResetViewButton.tsx)    ← T017 [P] ResetViewButton.module.css
    └── T018 (ModelViewerWrapper.tsx) ← T019 [P] ModelViewerWrapper.module.css
            └── T020 (ShowcasePage.tsx) ← T021 [P] ShowcasePage.module.css
                    └── T022 (page.tsx)
```

### Phase 4 & 5 — Can run in parallel (after US1)

```
US2:  T024 → T025 [P]  →  T026  →  T027
US3:  T028 → T029 [P]  →  T030  →  T031
```

### Phase 6 — Parallel polish tasks

```
T032 [P] unit/colorOptions.test.ts
T033 [P] unit/materialPresets.test.ts
T034     e2e/showcase.spec.ts (US1)
    └── T035 [P] e2e/showcase.spec.ts (US2+US3 extension)
T036 [P] Accessibility audit
    └── T037 quickstart.md validation
```

---

## Implementation Strategy

### MVP Scope

**Minimal viable demo = Phase 1 + Phase 2 + Phase 3 (US1 only)**

After T023, you have a working interactive 3D viewer with HDR lighting, loading state, error state, and camera reset — fully deployable and demonstrable. Colors and materials can be hard-coded to the first option from each config.

### Incremental Delivery

1. **Sprint 1** (Phases 1–3): Viewer works, model rotates, reset button works → deployable demo
2. **Sprint 2** (Phase 4): Color palette live → tangible interactive value for stakeholders
3. **Sprint 3** (Phase 5 + 6): Material presets + full test suite → production-ready MVP

### Task Count Summary

| Phase | Tasks | Parallel [P] | Story Label |
|-------|-------|-------------|-------------|
| 1 — Setup | 6 | T003–T006 | — |
| 2 — Foundational | 7 | T008–T011 | — |
| 3 — US1 (P1) | 10 | T015-T017, T019, T021 | [US1] |
| 4 — US2 (P2) | 4 | T025 | [US2] |
| 5 — US3 (P3) | 4 | T029 | [US3] |
| 6 — Polish | 6 | T032, T033, T035, T036 | — |
| **Total** | **37** | **14** | |
