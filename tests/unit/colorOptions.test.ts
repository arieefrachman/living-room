import { describe, it, expect } from 'vitest';
import { COLOR_OPTIONS } from '@/data/colorOptions';

describe('COLOR_OPTIONS', () => {
  it('has at least 4 items', () => {
    expect(COLOR_OPTIONS.length).toBeGreaterThanOrEqual(4);
  });

  it('has exactly one active item', () => {
    const activeItems = COLOR_OPTIONS.filter((c) => c.isActive);
    expect(activeItems).toHaveLength(1);
  });

  it('all hex values are valid hex colors', () => {
    const hexPattern = /^#[0-9a-fA-F]{3,6}$/;
    for (const option of COLOR_OPTIONS) {
      expect(option.hex, `hex for "${option.id}"`).toMatch(hexPattern);
    }
  });

  it('all id values are unique and kebab-case', () => {
    const ids = COLOR_OPTIONS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    const kebabPattern = /^[a-z][a-z0-9-]*$/;
    for (const id of ids) {
      expect(id, `id "${id}"`).toMatch(kebabPattern);
    }
  });
});
