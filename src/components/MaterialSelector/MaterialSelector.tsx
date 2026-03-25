'use client';

import type { MaterialPreset } from '@/types';
import MaterialThumbnail from './MaterialThumbnail';
import styles from './MaterialSelector.module.css';

interface MaterialSelectorProps {
  presets: MaterialPreset[];
  onSelect: (id: string) => void;
}

export default function MaterialSelector({ presets, onSelect }: MaterialSelectorProps) {
  return (
    <div className={styles.container}>
      <p className={styles.label}>Material</p>
      <div className={styles.list} role="group" aria-label="Material options">
        {presets.map((preset) => (
          <MaterialThumbnail key={preset.id} preset={preset} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
