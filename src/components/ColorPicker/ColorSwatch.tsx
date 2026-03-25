'use client';

import type { ColorOption } from '@/types';
import styles from './ColorSwatch.module.css';

interface ColorSwatchProps {
  option: ColorOption;
  onSelect: (id: string) => void;
}

export default function ColorSwatch({ option, onSelect }: ColorSwatchProps) {
  return (
    <button
      type="button"
      className={`${styles.swatch} ${option.isActive ? styles.active : ''}`}
      style={{ backgroundColor: option.hex }}
      aria-label={option.label}
      aria-pressed={option.isActive}
      onClick={() => onSelect(option.id)}
    />
  );
}
