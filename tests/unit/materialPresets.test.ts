import { describe, it, expect } from 'vitest';
import { MATERIAL_PRESETS } from '@/data/materialPresets';

describe('MATERIAL_PRESETS', () => {
  it('has at least 3 items', () => {
    expect(MATERIAL_PRESETS.length).toBeGreaterThanOrEqual(3);
  });

  it('has exactly one active item', () => {
    const activeItems = MATERIAL_PRESETS.filter((m) => m.isActive);
    expect(activeItems).toHaveLength(1);
  });

  it('all roughness and metalness values are within [0, 1]', () => {
    for (const preset of MATERIAL_PRESETS) {
      expect(preset.roughness, `roughness for "${preset.id}"`).toBeGreaterThanOrEqual(0);
      expect(preset.roughness, `roughness for "${preset.id}"`).toBeLessThanOrEqual(1);
      expect(preset.metalness, `metalness for "${preset.id}"`).toBeGreaterThanOrEqual(0);
      expect(preset.metalness, `metalness for "${preset.id}"`).toBeLessThanOrEqual(1);
    }
  });

  it('all thumbnail paths start with /textures/', () => {
    for (const preset of MATERIAL_PRESETS) {
      expect(preset.thumbnail, `thumbnail for "${preset.id}"`).toMatch(/^\/textures\//);
    }
  });

  it('all id values are unique', () => {
    const ids = MATERIAL_PRESETS.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
