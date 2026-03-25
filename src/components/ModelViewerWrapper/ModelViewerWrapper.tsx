'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import '@google/model-viewer';
import type { ModelViewerElement } from '@google/model-viewer';
import type { MaterialPreset } from '@/types';
import styles from './ModelViewerWrapper.module.css';

export interface ModelViewerWrapperProps {
  src: string;
  alt: string;
  initialCameraOrbit?: string;
  onLoad?: () => void;
  onError?: (errorType: string) => void;
  activeColor: string;
  activeMaterial: MaterialPreset;
  resetTrigger: number;
}

export default function ModelViewerWrapper({
  src,
  alt,
  initialCameraOrbit = '0deg 75deg 2.5m',
  onLoad,
  onError,
  activeColor,
  activeMaterial,
  resetTrigger,
}: ModelViewerWrapperProps) {
  const viewerRef = useRef<ModelViewerElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Keep a ref to current activeColor so async material apply can re-apply it
  const activeColorRef = useRef(activeColor);
  useEffect(() => {
    activeColorRef.current = activeColor;
  }, [activeColor]);

  const applyColor = useCallback((viewer: ModelViewerElement, hex: string) => {
    const material = viewer.model?.materials[0];
    if (!material) return;
    material.pbrMetallicRoughness.setBaseColorFactor(hex);
  }, []);

  const applyMaterial = useCallback(
    async (viewer: ModelViewerElement, preset: MaterialPreset) => {
      const material = viewer.model?.materials[0];
      if (!material) return;
      const pbr = material.pbrMetallicRoughness;

      pbr.setRoughnessFactor(preset.roughness);
      pbr.setMetallicFactor(preset.metalness);

      if (preset.textureUrl) {
        try {
          const texture = await viewer.createTexture(preset.textureUrl);
          pbr.baseColorTexture.setTexture(texture);
        } catch {
          // Texture failed to load — keep previous texture; color will still apply
        }
      } else {
        pbr.baseColorTexture.setTexture(null);
      }

      // Re-apply current color tint after material swap (FR-011 no cross-reset)
      pbr.setBaseColorFactor(activeColorRef.current);
    },
    [],
  );

  // Attach load / error event listeners on mount
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      setIsLoaded(true);
      applyColor(viewer, activeColorRef.current);
      onLoad?.();
    };

    const handleError = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string }>).detail?.type ?? 'unknown';
      setHasError(true);
      onError?.(detail);
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply color when activeColor changes and model is already loaded
  useEffect(() => {
    if (!isLoaded || !viewerRef.current) return;
    applyColor(viewerRef.current, activeColor);
  }, [activeColor, isLoaded, applyColor]);

  // Apply full material preset when activeMaterial changes
  useEffect(() => {
    if (!isLoaded || !viewerRef.current) return;
    applyMaterial(viewerRef.current, activeMaterial);
  }, [activeMaterial, isLoaded, applyMaterial]);

  // Reset camera when resetTrigger increments
  useEffect(() => {
    if (resetTrigger === 0 || !viewerRef.current) return;
    const viewer = viewerRef.current;
    viewer.cameraOrbit = initialCameraOrbit;
    viewer.jumpCameraToGoal();
  }, [resetTrigger, initialCameraOrbit]);

  if (hasError) {
    return (
      <div className={styles.errorContainer} role="alert">
        <div className={styles.errorIcon} aria-hidden="true">⚠</div>
        <p className={styles.errorTitle}>Failed to load the 3D model</p>
        <p className={styles.errorMessage}>
          Check that <code>chair.glb</code> is present in <code>/public/models/</code> and
          your browser supports WebGL.
        </p>
        <button
          type="button"
          className={styles.retryButton}
          onClick={() => setHasError(false)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <model-viewer
        ref={viewerRef}
        src={src}
        alt={alt}
        camera-controls=""
        environment-image="neutral"
        camera-orbit={initialCameraOrbit}
        class={styles.viewer}
      >
        <div slot="progress-bar" className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
      </model-viewer>
    </div>
  );
}
