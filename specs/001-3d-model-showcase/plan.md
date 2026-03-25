# Implementation Plan: 3D Living Room Model Showcase

**Branch**: `001-3d-model-showcase` | **Date**: 2026-03-25 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-3d-model-showcase/spec.md`

## Summary

Build a Next.js 15 (App Router, TypeScript, static export) web application that displays a single
chair GLB in an interactive 3D viewer powered by `@google/model-viewer` v4. Visitors can rotate,
zoom, and pan the model freely, reset the camera to default, apply one of ≥ 4 pre-defined color
tints to the chair's base material, and switch between ≥ 3 full PBR material presets (texture +
roughness + metalness). The page uses a neutral studio HDR environment, a minimal header shell, and
is designed for desktop (≥ 1024 px) only. No backend, no auth, no ecommerce in this MVP.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)  
**Primary Dependencies**: Next.js 15.x (App Router), `@google/model-viewer` 4.x, Vitest, Playwright  
**Storage**: None — static TypeScript config files (`src/data/`)  
**Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E)  
**Target Platform**: Desktop web browsers with WebGL 2 (Chrome ≥ 100, Firefox ≥ 100, Safari ≥ 15.4, Edge ≥ 100)  
**Project Type**: Web application (frontend-only, statically exported)  
**Performance Goals**: Initial load + 3D render ≤ 3 s (SC-001); color/material change ≤ 500 ms (SC-002); 3D interaction at ≥ 60 FPS (SC-003)  
**Constraints**: Desktop only (≥ 1024 px); no SSR needed (static export); model-viewer runs client-side only (`ssr: false`)  
**Scale/Scope**: Single page, single model, curated static config for colors and materials

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design. ✅ Both checks passed.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Code Quality | Linter (ESLint) + TypeScript strict enforced in CI; all components typed via shared interfaces in `src/types/`; single-responsibility components; no dead code | ✅ PASS |
| II. Testing Standards | Unit tests cover config invariants (≥ 80% coverage enforced); Playwright E2E covers all 3 user stories; tests follow Given/When/Then pattern; mocking only at DOM boundary (model-viewer stub in unit tests) | ✅ PASS |
| III. UX Consistency | Loading state: progress slot; Error state: visible message; Empty/reset state: camera reset button. WCAG 2.1 AA: `aria-pressed`, `aria-label`, keyboard-navigable buttons. Design system via CSS Modules tokens. 3D conventions: orbit/zoom/pan documented in contracts. | ✅ PASS |
| IV. Performance Requirements | model-viewer lazy-loaded via `dynamic(..., { ssr: false })`; GLB + textures served from `/public/` (CDN-cacheable on Vercel/Netlify); HDR uses built-in `neutral` preset (zero download); no blocking render path; Lighthouse CI target: LCP ≤ 3 s | ✅ PASS |

## Project Structure

### Documentation (this feature)

```text
specs/001-3d-model-showcase/
├── plan.md                   ← This file
├── research.md               ← Phase 0 decisions
├── data-model.md             ← Entity definitions and TypeScript shapes
├── quickstart.md             ← Dev setup and run guide
├── contracts/
│   └── component-contracts.md  ← Prop interfaces and behaviour contracts
└── tasks.md                  ← Phase 2 output (/speckit.tasks — NOT yet created)
```

### Source Code

```text
demo-platform-3d/
├── public/
│   ├── models/
│   │   └── chair.glb                  ← single GLB asset (provided by team)
│   └── textures/
│       ├── cream-leather.jpg
│       ├── cream-leather-thumb.jpg
│       ├── blue-velvet.jpg
│       ├── blue-velvet-thumb.jpg
│       ├── walnut-wood.jpg
│       └── walnut-wood-thumb.jpg
├── src/
│   ├── app/
│   │   ├── layout.tsx                 ← root layout; sets metadata; server component
│   │   ├── page.tsx                   ← renders ShowcasePage; server component
│   │   └── globals.css
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── Header.module.css
│   │   ├── ModelViewerWrapper/
│   │   │   ├── ModelViewerWrapper.tsx ← 'use client'; wraps <model-viewer>
│   │   │   └── ModelViewerWrapper.module.css
│   │   ├── ColorPicker/
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── ColorSwatch.tsx
│   │   │   └── ColorPicker.module.css
│   │   ├── MaterialSelector/
│   │   │   ├── MaterialSelector.tsx
│   │   │   ├── MaterialThumbnail.tsx
│   │   │   └── MaterialSelector.module.css
│   │   ├── ResetViewButton/
│   │   │   ├── ResetViewButton.tsx
│   │   │   └── ResetViewButton.module.css
│   │   └── ShowcasePage/
│   │       ├── ShowcasePage.tsx       ← 'use client'; owns ViewerState
│   │       └── ShowcasePage.module.css
│   ├── data/
│   │   ├── chairModel.ts
│   │   ├── colorOptions.ts
│   │   └── materialPresets.ts
│   └── types/
│       ├── index.ts                   ← ChairModel, ColorOption, MaterialPreset
│       └── model-viewer.d.ts          ← JSX IntrinsicElements extension
├── tests/
│   ├── unit/
│   │   ├── colorOptions.test.ts
│   │   └── materialPresets.test.ts
│   └── e2e/
│       └── showcase.spec.ts
├── next.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── tsconfig.json
```

**Structure Decision**: Single-project web app (Option 2 from template). No backend — pure static
frontend. `src/` holds all application code. `public/` serves 3D assets via Next.js static file
serving. `tests/` is co-located at root for clarity.

## Key Architecture Decisions

### model-viewer integration pattern

`<model-viewer>` registers a Web Component at import time — it accesses `window` and `document`
immediately. In Next.js App Router, all RSC rendering is server-side. Therefore:

1. `ModelViewerWrapper.tsx` is tagged `'use client'`.
2. The `ShowcasePage` imports it via `dynamic(() => import(...), { ssr: false })` to prevent
   the import from running during SSR.
3. The `<model-viewer>` JSX element is typed via `src/types/model-viewer.d.ts` so TypeScript
   does not error on the custom element.

### Color + Material composition

Color tint and material preset are independent: the `ShowcasePage` holds `activeColorHex` and
`activeMaterialId` as separate state. When material changes, `ModelViewerWrapper` applies the
new PBR properties and then immediately re-applies `activeColorHex` via `setBaseColorFactor`.
This satisfies FR-011 (no cross-reset).

### Static config as single source of truth

No database, no API. All customization options live in `src/data/`. Each file exports a typed
array. Adding a new color or material requires only editing the relevant data file. The config
invariant (exactly one `isActive: true` per array) is enforced by a Vitest unit test.

### Camera reset

`ModelViewerWrapper` exposes a `resetTrigger: number` prop. `ShowcasePage` increments this
counter when the user clicks "Reset view". The wrapper useEffect watches `resetTrigger` and
calls `viewer.cameraOrbit = initialCameraOrbit` + `viewer.jumpCameraToGoal()` when it changes.
This avoids exposing an imperative ref to the parent.

## Constitution Check — Post-Design Re-evaluation

*Re-evaluated after Phase 1 design is complete:*

| Principle | Re-check | Notes |
|-----------|----------|-------|
| I. Code Quality | ✅ PASS | All components have single responsibility; prop interfaces in shared types file; no dead code identified in design |
| II. Testing Standards | ✅ PASS | Unit tests for config invariants; Playwright E2E per user story; mocking scoped to model-viewer DOM boundary only |
| III. UX Consistency | ✅ PASS | All required states (loading, error, active selection, reset) designed; WCAG notes in contracts |
| IV. Performance | ✅ PASS | `ssr: false` prevents SSR overhead; static export maximizes CDN caching; HDR via built-in preset (0 bytes extra); texture swap is async but bounded |

**No violations. No Complexity Tracking entries required.**

## Complexity Tracking

> No constitution violations. This section intentionally empty.

