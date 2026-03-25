'use client';

import type { MaterialPreset } from '@/types';
import styles from './MaterialThumbnail.module.css';

interface MaterialThumbnailProps {
  preset: MaterialPreset;
  onSelect: (id: string) => void;
}

export default function MaterialThumbnail({ preset, onSelect }: MaterialThumbnailProps) {
  return (
    <button
      type="button"
      className={`${styles.thumbnail} ${preset.isActive ? styles.active : ''}`}
      aria-label={preset.label}
      aria-pressed={preset.isActive}
      onClick={() => onSelect(preset.id)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={preset.thumbnail}
        alt=""
        className={styles.image}
        width={48}
        height={48}
      />
      <span className={styles.labelText}>{preset.label}</span>
    </button>
  );
}
