# UI Component Contracts: 3D Living Room Model Showcase
**Phase**: 1  
**Date**: 2026-03-25  
**Type**: Client-side application — no HTTP API. Contracts are component prop interfaces and config schemas.

---

## Data Type Contracts (TypeScript)

These types are the shared language between data config files and UI components. They are
the source of truth — if an implementation diverges from these types, it is a bug.

```typescript
// src/types/index.ts

export interface ChairModel {
  name: string;                   // Display name / alt text base
  src: string;                    // Path under /public/, e.g. "/models/chair.glb"
  alt: string;                    // Accessible description
  initialCameraOrbit?: string;    // e.g. "0deg 75deg 2.5m" — optional
}

export interface ColorOption {
  id: string;         // Unique kebab-case key
  label: string;      // Human-readable label
  hex: string;        // CSS hex, e.g. "#c48b9f"
  isActive: boolean;
}

export interface MaterialPreset {
  id: string;                // Unique kebab-case key
  label: string;             // Human-readable name, e.g. "Cream Leather"
  thumbnail: string;         // Path under /public/, e.g. "/textures/cream-leather-thumb.jpg"
  textureUrl: string | null; // Path to albedo map, or null for solid-color-only
  roughness: number;         // [0, 1]
  metalness: number;         // [0, 1]
  isActive: boolean;
}
```

---

## Component Contracts

### `<ModelViewerWrapper>`

Wraps the `<model-viewer>` web component. Must be dynamically imported with `{ ssr: false }` and tagged `'use client'`.

```typescript
interface ModelViewerWrapperProps {
  /** GLB source path */
  src: string;
  /** Accessible alt text */
  alt: string;
  /** Default camera orbit string */
  initialCameraOrbit?: string;
  /** Called when model finishes loading */
  onLoad?: () => void;
  /** Called when model fails to load */
  onError?: (errorType: string) => void;
  /** Hex color to apply to the primary material's base color */
  activeColor: string;
  /** Full material preset to apply to the primary material */
  activeMaterial: MaterialPreset;
  /** Imperative reset trigger — increment to fire a camera reset */
  resetTrigger: number;
}
```

**Behaviour contract**:
- When `activeColor` changes, calls `material.pbrMetallicRoughness.setBaseColorFactor(activeColor)` on the loaded model's primary material.
- When `activeMaterial` changes, applies `roughness`, `metalness`, and swaps `textureUrl` (if non-null), then re-applies the current `activeColor` tint.
- When `resetTrigger` increments, calls `viewer.cameraOrbit = initialCameraOrbit` and `viewer.jumpCameraToGoal()`.
- Renders a `[slot="progress"]` loading spinner while `isLoading` (managed internally).
- On error, fires `onError(errorType)` — does NOT throw; error display is the parent's responsibility.

---

### `<ColorPicker>`

```typescript
interface ColorPickerProps {
  options: ColorOption[];
  onSelect: (id: string) => void;
}
```

**Behaviour contract**:
- Renders one `<ColorSwatch>` per option.
- The swatch whose `isActive === true` receives an `aria-pressed="true"` attribute and a visual active indicator.
- Calls `onSelect(option.id)` on click; does NOT mutate `options` directly.

---

### `<ColorSwatch>`

```typescript
interface ColorSwatchProps {
  option: ColorOption;
  onSelect: (id: string) => void;
}
```

**Behaviour contract**:
- Renders a clickable, keyboard-accessible button (role=button or `<button>`).
- Background color = `option.hex`.
- `aria-label` = `option.label`.
- Active state styled with a ring/border; inactive state styled without.

---

### `<MaterialSelector>`

```typescript
interface MaterialSelectorProps {
  presets: MaterialPreset[];
  onSelect: (id: string) => void;
}
```

**Behaviour contract**:
- Renders one `<MaterialThumbnail>` per preset.
- Active preset visually distinguished; `aria-pressed="true"` on active button.
- Calls `onSelect(preset.id)` on click.

---

### `<MaterialThumbnail>`

```typescript
interface MaterialThumbnailProps {
  preset: MaterialPreset;
  onSelect: (id: string) => void;
}
```

**Behaviour contract**:
- Renders a clickable button containing `thumbnail` image + `label` text.
- Image loaded from `preset.thumbnail` via Next.js `<Image>` component.
- Active state styled with border/ring; inactive without.

---

### `<ResetViewButton>`

```typescript
interface ResetViewButtonProps {
  onReset: () => void;
}
```

**Behaviour contract**:
- Renders a visible `<button>` labeled "Reset view" (or an icon with `aria-label="Reset view"`).
- Calls `onReset()` on click.
- Never disabled — always actionable (resetting an already-default camera is a no-op and that is acceptable).

---

### `<Header>`

```typescript
interface HeaderProps {
  brandName: string;
}
```

**Behaviour contract**:
- Renders a `<header>` element with the brand name / logo.
- No navigation links, no cart icon, no user menu — MVP shell only.

---

## Static Config Schema Contract

All static data files export typed arrays/objects matching the TypeScript interfaces above.
Adding a new color or material requires only adding an entry to the relevant config file —
no component code changes required.

Files:
- `src/data/chairModel.ts` — exports `CHAIR_MODEL: ChairModel`
- `src/data/colorOptions.ts` — exports `COLOR_OPTIONS: ColorOption[]` (≥ 4 entries, exactly 1 `isActive: true`)
- `src/data/materialPresets.ts` — exports `MATERIAL_PRESETS: MaterialPreset[]` (≥ 3 entries, exactly 1 `isActive: true`)

**Invariant** (enforced by unit test): In each config array, exactly one entry has `isActive: true`.

---

## Browser Environment Contract

| Requirement | Value |
|-------------|-------|
| Minimum screen width | 1024 px |
| Required browser capability | WebGL 2.0 (required by model-viewer v4) |
| Supported browsers | Chrome ≥ 100, Firefox ≥ 100, Safari ≥ 15.4, Edge ≥ 100 |
| If WebGL unavailable | `<model-viewer>` `error` event fires; app shows degraded-state message |
| Network | Public internet or local dev server; no auth required |
