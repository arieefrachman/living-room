# Research: 3D Living Room Model Showcase
**Phase**: 0 — Unknowns resolved  
**Date**: 2026-03-25  
**Feature**: [spec.md](spec.md)

---

## Decision 1: 3D Rendering Library

**Decision**: `@google/model-viewer` v4.x (web component)  
**Rationale**:
- Native web component (`<model-viewer>`) — zero framework lock-in; works cleanly with Next.js via a client-only dynamic import wrapper.
- Ships with built-in camera-controls (orbit, zoom, pan), HDR environment-image support, loading/error slots, and a Material Scene Graph API for runtime PBR manipulation.
- `viewer.model.materials[n].pbrMetallicRoughness.setBaseColorFactor(hex)` handles US2 (color tint) directly.
- GLB material variants (`variant-name` attribute) cover US3 (full PBR material preset swap) with no extra code when the GLB embeds variants; runtime Scene Graph API is the fallback when variants are baked in via JS instead.
- `viewer.cameraOrbit = viewer.initialCameraOrbit` + `viewer.jumpCameraToGoal()` implements the Reset view button (US1-S7).
- Latest version as of 2026-03-25: **4.0.0** (CDN and npm). TypeScript types ship in the `@google/model-viewer` package.

**Integration with Next.js**:
- `@google/model-viewer` registers a custom DOM element and touches `document` / `window` — it MUST run client-side only.
- Pattern: `dynamic(() => import('@/components/ModelViewer'), { ssr: false })` inside a `'use client'` wrapper component.
- The component is rendered inside Next.js App Router — the wrapping page is a server component; only the viewer wrapper is a client component.

**Alternatives considered**:
- Three.js + React Three Fiber: More flexible / lower-level but requires significant boilerplate for camera controls, HDR loader, GLTF loader, and material APIs. Adds ~6× the setup work for no added user-facing value at MVP scale. Deferred for future ecommerce phase if advanced scene control is needed.
- Babylon.js: Similar tradeoff — powerful, but heavyweight for a single-model showcase. Not needed here.

---

## Decision 2: Framework and Language

**Decision**: Next.js 15.x (App Router) + TypeScript  
**Rationale**:
- Explicitly requested by the user.
- App Router (Next.js 13+) is the current recommended architecture; file-based routing under `app/`.
- TypeScript enforces type-safety on the model-viewer element (`ModelViewerElement` type), color and material preset data structures, and component props — directly supports Constitution Principle I (Code Quality).
- Static export (`output: 'export'`) is viable since there are no server-side data requirements for MVP; the app is a pure client-side SPA deployed as static files.

**Key App Router facts (from Context7)**:
- Root layout at `app/layout.tsx` wraps all routes; defines `<html>` and `<body>` with metadata.
- Single showcase page at `app/page.tsx` (server component that renders the client viewer wrapper).
- Static assets (GLB model, HDR file, texture maps, thumbnail images) served from `/public/`.
- Client-only components tagged with `'use client'`; dynamic imports with `{ ssr: false }` for web components that touch DOM at import time.

**Alternatives considered**:
- Vite + React (SPA): User explicitly requested Next.js. Deferred.
- Next.js Pages Router: App Router is recommended for all new projects as of Next.js 13+.

---

## Decision 3: Styling Approach

**Decision**: CSS Modules (`.module.css`) co-located with components  
**Rationale**:
- Ships with Next.js out of the box — zero additional dependency.
- Scoped class names prevent style leakage across components (supports Constitution Principle I).
- For a minimal-shell MVP with one page, a full CSS-in-JS library (e.g., styled-components, Emotion) or a utility framework (Tailwind) would be over-engineering. Tailwind is a valid future choice if the ecommerce phase needs design-system tokens at scale.

**Alternatives considered**:
- Tailwind CSS: Reasonable but adds a build plugin and configuration for one page. Deferred.
- Inline styles: Readable for simple cases but not maintainable; violates constitution naming/consistency principle.

---

## Decision 4: Color Tint API

**Decision**: `material.pbrMetallicRoughness.setBaseColorFactor(cssColorString)` from the model-viewer scene graph API.  
**Rationale (from Context7 docs)**:
- `setBaseColorFactor` accepts CSS color strings (sRGB) or `[r, g, b, a]` linear arrays.
- Call fires synchronously; the render loop picks up the change on the next animation frame → well within 500 ms SC-002.
- Does NOT reset roughness/metalness on the active material — directly satisfies FR-011.

**Implementation note**: Color tinting targets only the first material by default for an MVP chair with a single material. For chairs with multiple named materials (e.g., cushion vs. frame), the implementation targets the primary material by name using `model.getMaterialByName('Fabric')`.

---

## Decision 5: Material Preset Swap API

**Decision**: Runtime Scene Graph API — on preset select, call `setBaseColorFactor` + `setMetallicFactor` + `setRoughnessFactor`, and swap the `baseColorTexture` via a new `createTexture` call if the GLB does not embed glTF Material Variants.  
**Rationale**:
- If the provided GLB embeds glTF KHR_materials_variants, the cleaner API is `viewer.variantName = presetName` — a one-liner. This is the preferred path.
- If the GLB does not embed variants (likely for MVP since the GLB source is unknown), we use the Scene Graph API to swap PBR properties programmatically. Texture maps for each preset are stored as image files in `/public/textures/` and loaded at runtime with `viewer.createTexture(url)`.
- Both approaches are < 500 ms update time for local/cached assets.
- Preset definitions (name, color, roughness, metalness, texture URL) live in a static config file `src/data/materialPresets.ts`. This makes the curated list trivially editable without touching component code.

---

## Decision 6: HDR Environment

**Decision**: Use the built-in `environment-image="neutral"` preset shipped with model-viewer for MVP; replace with a custom `.hdr` file from `/public/env/` when the team sources a preferred HDR.  
**Rationale**:
- `environment-image="neutral"` is a high-quality studio preset built into model-viewer — no file download required, zero asset procurement risk for MVP launch.
- Switching to a custom HDR later requires only changing one attribute value and dropping the file in `/public/env/`. No code change.
- Background color set via CSS on the `model-viewer` element (`background-color: #f5f5f5` or similar gradient). fr-017 satisfied without a skybox image.

---

## Decision 7: Testing Strategy

**Decision**: Vitest + React Testing Library for unit/component tests; Playwright for E2E interaction tests.  
**Rationale**:
- Vitest integrates natively with Next.js and is fast (Vite-based). RTL for component-level assertions.
- Playwright for E2E covers the critical user journeys (viewer loads, color change, material swap, reset button) — these cannot be meaningfully tested via unit tests alone since they depend on the `<model-viewer>` DOM element.
- model-viewer custom element must be mocked/stubbed in unit tests (it requires a real browser GPU context). Playwright runs against a real Chromium instance.
- Constitution II (Testing Standards) requires ≥ 80% coverage and Given/When/Then patterns — Playwright test descriptions will follow this pattern.

---

## NEEDS CLARIFICATION — All Resolved

| Item | Resolution |
|------|-----------|
| Target devices | Desktop only ≥ 1024 px |
| Number of chair models | Exactly one GLB, fixed |
| Page shell | Minimal: header + viewer + controls |
| Scene environment | HDR IBL (`neutral` preset), plain background |
| Camera reset | "Reset view" button |
| Material vs texture | Full PBR material preset (Scene Graph API or glTF variants) |
