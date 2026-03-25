# Quickstart: 3D Living Room Model Showcase
**Date**: 2026-03-25

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | ≥ 20.x | `node -v` |
| pnpm (or npm/yarn) | ≥ 9.x | `pnpm -v` |
| A GLB chair model file | Any | Place at `public/models/chair.glb` |
| Texture image files | PNG or JPG | Place at `public/textures/` |

---

## 1. Bootstrap Next.js App

```bash
pnpm create next-app@latest demo-platform-3d \
  --typescript \
  --eslint \
  --no-tailwind \
  --src-dir \
  --no-app \   # We will configure App Router manually for clarity
  --import-alias "@/*"
```

Or, if you already have the repo:
```bash
cd demo-platform-3d
pnpm install
```

---

## 2. Install Dependencies

```bash
# Runtime
pnpm add @google/model-viewer

# Dev / test
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom \
           @playwright/test jsdom
```

---

## 3. Configure `next.config.ts`

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',          // Static export — no server required for MVP
  images: { unoptimized: true }, // Required with output: 'export'
}

export default nextConfig
```

---

## 4. Configure TypeScript for model-viewer

Add the model-viewer global JSX type to your `tsconfig.json` or a declaration file:

```typescript
// src/types/model-viewer.d.ts
/// <reference types="@google/model-viewer" />

// Extend JSX IntrinsicElements so <model-viewer> is typed in TSX
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string
        alt?: string
        'camera-controls'?: boolean
        'auto-rotate'?: boolean
        'shadow-intensity'?: string | number
        'environment-image'?: string
        'camera-orbit'?: string
        'field-of-view'?: string
        exposure?: string | number
        style?: React.CSSProperties
      },
      HTMLElement
    >
  }
}
```

---

## 5. Project Structure

After setup, the source tree should look like this:

```
demo-platform-3d/
├── public/
│   ├── models/
│   │   └── chair.glb              ← drop your GLB here
│   └── textures/
│       ├── cream-leather.jpg
│       ├── cream-leather-thumb.jpg
│       ├── blue-velvet.jpg
│       ├── blue-velvet-thumb.jpg
│       ├── walnut-wood.jpg
│       └── walnut-wood-thumb.jpg
├── src/
│   ├── app/
│   │   ├── layout.tsx             ← root layout (server component)
│   │   ├── page.tsx               ← showcase page (server component)
│   │   └── globals.css
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── Header.module.css
│   │   ├── ModelViewerWrapper/
│   │   │   ├── ModelViewerWrapper.tsx   ← 'use client', dynamic import
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
│   │       ├── ShowcasePage.tsx         ← 'use client' root for the viewer
│   │       └── ShowcasePage.module.css
│   ├── data/
│   │   ├── chairModel.ts
│   │   ├── colorOptions.ts
│   │   └── materialPresets.ts
│   └── types/
│       ├── index.ts               ← shared TypeScript interfaces
│       └── model-viewer.d.ts      ← JSX type extension
├── tests/
│   ├── unit/
│   │   ├── colorOptions.test.ts
│   │   └── materialPresets.test.ts
│   └── e2e/
│       └── showcase.spec.ts       ← Playwright E2E
├── next.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. Run Development Server

```bash
pnpm dev
# Opens at http://localhost:3000
```

---

## 7. Run Tests

```bash
# Unit tests
pnpm test           # runs Vitest in watch mode
pnpm test:run       # runs once (CI mode)

# E2E tests (requires dev server to be running, or use webServer in playwright.config.ts)
pnpm playwright test
```

---

## 8. Build & Export

```bash
pnpm build
# Static output written to ./out/
# Open with: npx serve out
```

---

## 9. Verify Core Functionality Manually

1. Open `http://localhost:3000`
2. A loading indicator appears, then the chair renders in 3D — **SC-001 pass**
3. Drag to rotate, scroll to zoom, right-drag to pan — **FR-002/003/004 pass**
4. Click "Reset view" — camera returns to default — **FR-018 pass**
5. Click each color swatch — chair color changes without page reload — **FR-008 pass**
6. Click each material preset — full PBR surface updates — **FR-010 pass**
7. Select a preset, then a color — color tints the material without resetting it — **FR-011 pass**

---

## 10. Add / Update Content

- **New color**: Add an entry to `src/data/colorOptions.ts`. No component changes needed.
- **New material preset**: Add an entry to `src/data/materialPresets.ts` and drop the texture + thumbnail in `public/textures/`.
- **New GLB model**: Replace `public/models/chair.glb` and update `src` in `src/data/chairModel.ts`.
