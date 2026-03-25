# demo-platform-3d Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-25

## Active Technologies

- **Language**: TypeScript (strict)
- **Framework**: Next.js 15.x — App Router (`app/` directory), static export (`output: 'export'`)
- **3D Viewer**: `@google/model-viewer` v4.x — web component, client-side only (`'use client'` + `dynamic(..., { ssr: false })`)
- **Styling**: CSS Modules (`.module.css`), co-located with components
- **Testing**: Vitest + React Testing Library (unit), Playwright (E2E)
- **Storage**: None — all configuration is static TypeScript files in `src/data/`
- **Assets**: GLB model at `public/models/`, texture maps + thumbnails at `public/textures/`

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx          # Root layout (server component)
│   ├── page.tsx            # Showcase page (server component)
│   └── globals.css
├── components/
│   ├── Header/
│   ├── ModelViewerWrapper/ # 'use client' — wraps <model-viewer>
│   ├── ColorPicker/
│   ├── MaterialSelector/
│   ├── ResetViewButton/
│   └── ShowcasePage/       # 'use client' — orchestrates viewer state
├── data/
│   ├── chairModel.ts
│   ├── colorOptions.ts
│   └── materialPresets.ts
└── types/
    ├── index.ts            # Shared interfaces (ChairModel, ColorOption, MaterialPreset)
    └── model-viewer.d.ts   # JSX type extension for <model-viewer>

public/
├── models/chair.glb
└── textures/

tests/
├── unit/
└── e2e/
```

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Static export to ./out/
pnpm test         # Vitest unit tests (watch mode)
pnpm test:run     # Vitest unit tests (CI, single pass)
pnpm playwright test  # E2E tests
```

## Code Style

- TypeScript strict mode; no `any`
- CSS Modules for all styling; no inline styles
- All `'use client'` components explicitly tagged
- `<model-viewer>` always imported via `dynamic(..., { ssr: false })`
- Config arrays in `src/data/` must always have exactly 1 entry with `isActive: true`
- Component props typed via interfaces in `src/types/index.ts`

## model-viewer Key APIs (v4.x)

```typescript
// Color tint
viewer.model.materials[0].pbrMetallicRoughness.setBaseColorFactor('#hex')

// Material PBR swap
const pbr = viewer.model.materials[0].pbrMetallicRoughness
pbr.setRoughnessFactor(0.3)
pbr.setMetallicFactor(0.0)
// Texture swap:
const tex = await viewer.createTexture('/textures/cream-leather.jpg')
await pbr.baseColorTexture.setTexture(tex)

// Camera reset
viewer.cameraOrbit = '0deg 75deg 2.5m'
viewer.jumpCameraToGoal()
```

## Recent Changes

- 2026-03-25 (001-3d-model-showcase): Next.js + @google/model-viewer stack defined; static config architecture for colors/materials established; Vitest+Playwright testing strategy set.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

