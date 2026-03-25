'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header/Header';
import ResetViewButton from '@/components/ResetViewButton/ResetViewButton';
import ColorPicker from '@/components/ColorPicker/ColorPicker';
import { CHAIR_MODEL } from '@/data/chairModel';
import { COLOR_OPTIONS } from '@/data/colorOptions';
import type { ColorOption } from '@/types';
import styles from './ShowcasePage.module.css';

// Dynamically import ModelViewerWrapper with SSR disabled — model-viewer
// registers a Web Component that accesses `window` at import time.
const ModelViewerWrapper = dynamic(
  () => import('@/components/ModelViewerWrapper/ModelViewerWrapper'),
  { ssr: false },
);

export default function ShowcasePage() {
  const [activeColorId, setActiveColorId] = useState<string>(
    COLOR_OPTIONS.find((c) => c.isActive)?.id ?? COLOR_OPTIONS[0].id,
  );
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const colorOptions: ColorOption[] = useMemo(
    () => COLOR_OPTIONS.map((c) => ({ ...c, isActive: c.id === activeColorId })),
    [activeColorId],
  );

  const activeColorHex =
    colorOptions.find((c) => c.id === activeColorId)?.hex ?? COLOR_OPTIONS[0].hex;

  const handleColorSelect = useCallback((id: string) => {
    setActiveColorId(id);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((n) => n + 1);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* Left column: 3D viewer */}
        <section className={styles.viewerSection} aria-label="3D chair viewer">
          <div className={styles.viewerContainer}>
            {isLoading && (
              <div className={styles.loadingOverlay} aria-live="polite" aria-label="Loading 3D model">
                <div className={styles.spinner} aria-hidden="true" />
              </div>
            )}
            <ModelViewerWrapper
              src={CHAIR_MODEL.src}
              alt={CHAIR_MODEL.alt}
              initialCameraOrbit={CHAIR_MODEL.initialCameraOrbit}
              activeColor={activeColorHex}
              resetTrigger={resetTrigger}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>

          <div className={styles.viewerActions}>
            <ResetViewButton onReset={handleReset} />
          </div>
        </section>

        {/* Right column: controls */}
        <aside className={styles.controls} aria-label="Customisation controls">
          <ColorPicker options={colorOptions} onSelect={handleColorSelect} />
        </aside>
      </main>
    </div>
  );
}
