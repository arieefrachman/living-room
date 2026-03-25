import type { MaterialPreset } from '@/types';

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: 'cream-leather',
    label: 'Cream Leather',
    thumbnail: '/textures/cream-leather-thumb.jpg',
    textureUrl: '/textures/cream-leather.jpg',
    roughness: 0.3,
    metalness: 0.0,
    isActive: true,
  },
  {
    id: 'blue-velvet',
    label: 'Blue Velvet',
    thumbnail: '/textures/blue-velvet-thumb.jpg',
    textureUrl: '/textures/blue-velvet.jpg',
    roughness: 0.9,
    metalness: 0.0,
    isActive: false,
  },
  {
    id: 'walnut-wood',
    label: 'Walnut Wood',
    thumbnail: '/textures/walnut-wood-thumb.jpg',
    textureUrl: '/textures/walnut-wood.jpg',
    roughness: 0.6,
    metalness: 0.0,
    isActive: false,
  },
];
