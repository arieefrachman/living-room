'use client';

import type { ColorOption } from '@/types';
import ColorSwatch from './ColorSwatch';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  options: ColorOption[];
  onSelect: (id: string) => void;
}

export default function ColorPicker({ options, onSelect }: ColorPickerProps) {
  return (
    <div className={styles.container}>
      <p className={styles.label}>Color</p>
      <div className={styles.swatches} role="group" aria-label="Color options">
        {options.map((option) => (
          <ColorSwatch key={option.id} option={option} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
