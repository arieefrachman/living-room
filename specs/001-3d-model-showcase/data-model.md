# Data Model: 3D Living Room Model Showcase
**Phase**: 1  
**Date**: 2026-03-25  
**Feature**: [spec.md](spec.md) | [research.md](research.md)

---

## Entities

### ChairModel

Represents the single 3D GLB asset displayed in the showcase.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `name` | `string` | Display name shown in the page header or alt text | Non-empty |
| `src` | `string` | URL path to the GLB file, e.g. `/models/chair.glb` | Must be a valid `/public/` path |
| `alt` | `string` | Accessible alt description for the model viewer | Non-empty |
| `initialCameraOrbit` | `string \| undefined` | Default camera orbit string, e.g. `"0deg 75deg 2m"` | Optional; falls back to model-viewer default |

**Validation rules**:
- Exactly one `ChairModel` instance exists in the app (single static config, not a list).
- `src` must resolve to a file under `/public/models/`.

**State transitions**: None — the model is static. Only its material properties are mutated at runtime via the model-viewer Scene Graph API.

---

### ColorOption

A pre-defined color tint that can be applied to the active material's base color.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | `string` | Unique identifier, e.g. `"dusty-rose"` | Unique across all ColorOptions; kebab-case |
| `label` | `string` | Display label, e.g. `"Dusty Rose"` | Non-empty |
| `hex` | `string` | CSS hex color string, e.g. `"#c48b9f"` | Valid 3 or 6-digit hex with `#` prefix |
| `isActive` | `boolean` | Currently selected state | Default: `false`; exactly one is `true` at any time |

**Validation rules**:
- At least 4 `ColorOption` entries must be present in the static config.
- Exactly one `ColorOption` has `isActive === true` at any given time (selection is exclusive).

**State transitions**:
```
Any ColorOption(isActive=false) ──[user click]──▶ ColorOption(isActive=true)
Previous active ColorOption     ──[same click]──▶ ColorOption(isActive=false)
```

---

### MaterialPreset

A complete PBR surface definition. Selecting a preset replaces all PBR properties on the material simultaneously.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | `string` | Unique identifier, e.g. `"cream-leather"` | Unique; kebab-case |
| `label` | `string` | Display name, e.g. `"Cream Leather"` | Non-empty |
| `thumbnail` | `string` | URL path to a thumbnail preview image, e.g. `/textures/cream-leather-thumb.jpg` | Must resolve to `/public/textures/` |
| `textureUrl` | `string \| null` | URL to the albedo/base-color texture map, e.g. `/textures/cream-leather.jpg`. `null` if the preset uses a solid-color base only. | If non-null, must resolve to `/public/textures/` |
| `roughness` | `number` | PBR roughness factor (0 = mirror-smooth, 1 = fully matte) | `0 ≤ roughness ≤ 1` |
| `metalness` | `number` | PBR metalness factor (0 = dielectric, 1 = fully metallic) | `0 ≤ metalness ≤ 1` |
| `isActive` | `boolean` | Currently selected state | Default: `false`; exactly one is `true` at any time |

**Validation rules**:
- At least 3 `MaterialPreset` entries must be present in the static config.
- Exactly one `MaterialPreset` has `isActive === true` at any given time.
- `roughness` and `metalness` must be clamped to `[0, 1]` before being passed to the model-viewer API.

**State transitions**:
```
Any MaterialPreset(isActive=false) ──[user click]──▶ MaterialPreset(isActive=true)
                                                      → apply textureUrl + roughness + metalness to scene
Previous active MaterialPreset     ──[same click]──▶ MaterialPreset(isActive=false)
```

---

### ViewerState (UI / in-memory only — not persisted)

Runtime state managed by the React client component. Not stored anywhere beyond the browser session.

| Field | Type | Description |
|-------|------|-------------|
| `activeColorId` | `string` | `id` of the currently selected `ColorOption` |
| `activeMaterialId` | `string` | `id` of the currently selected `MaterialPreset` |
| `isLoading` | `boolean` | `true` while the GLB is being fetched |
| `hasError` | `boolean` | `true` if the GLB failed to load |

**Initial state**: First `ColorOption` and first `MaterialPreset` in each config list are active. `isLoading = true`, `hasError = false`.

---

## Static Configuration Files (source of truth — no database)

```typescript
// src/data/chairModel.ts
export const CHAIR_MODEL: ChairModel = {
  name: 'Showcase Chair',
  src: '/models/chair.glb',
  alt: 'An interactive 3D showcase chair you can rotate, zoom, and customise',
  initialCameraOrbit: '0deg 75deg 2.5m',
};

// src/data/colorOptions.ts
export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'ivory',       label: 'Ivory',       hex: '#f5f0e8', isActive: true  },
  { id: 'charcoal',    label: 'Charcoal',    hex: '#3d3d3d', isActive: false },
  { id: 'dusty-rose',  label: 'Dusty Rose',  hex: '#c48b9f', isActive: false },
  { id: 'sage-green',  label: 'Sage Green',  hex: '#87a96b', isActive: false },
];

// src/data/materialPresets.ts
export const MATERIAL_PRESETS: MaterialPreset[] = [
  { id: 'cream-leather', label: 'Cream Leather', thumbnail: '/textures/cream-leather-thumb.jpg', textureUrl: '/textures/cream-leather.jpg', roughness: 0.3, metalness: 0.0, isActive: true  },
  { id: 'blue-velvet',   label: 'Blue Velvet',   thumbnail: '/textures/blue-velvet-thumb.jpg',   textureUrl: '/textures/blue-velvet.jpg',   roughness: 0.9, metalness: 0.0, isActive: false },
  { id: 'walnut-wood',   label: 'Walnut Wood',   thumbnail: '/textures/walnut-wood-thumb.jpg',   textureUrl: '/textures/walnut-wood.jpg',   roughness: 0.6, metalness: 0.0, isActive: false },
];
```

---

## Component Tree (UI entities)

```
app/
└── page.tsx (Server Component)
    └── ShowcasePage (Client Component, 'use client')
        ├── Header
        │   └── brand name / logo
        ├── ViewerPanel
        │   ├── ModelViewerWrapper  ← dynamic import, ssr:false
        │   │   └── <model-viewer> web component
        │   └── ResetViewButton
        └── ControlsPanel
            ├── ColorPicker
            │   └── ColorSwatch × N
            └── MaterialSelector
                └── MaterialThumbnail × N
```

---

## Relationships

```
ChairModel ─────────────────┐
                             │  loaded into
                             ▼
                      <model-viewer>
                             │
              ┌──────────────┼──────────────┐
              │                             │
    ColorOption.hex               MaterialPreset
    setBaseColorFactor()          setRoughnessFactor()
                                  setMetallicFactor()
                                  createTexture(textureUrl)
```

`ColorOption` and `MaterialPreset` selections compose: applying a new color does NOT reset the active material, and selecting a new material does NOT reset the active color tint. The active color is re-applied after every material preset swap.
