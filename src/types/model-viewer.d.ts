import type { ModelViewerElement } from '@google/model-viewer';
import 'react';

type ModelViewerJSXProps = Partial<{
  // Asset
  src: string;
  alt: string;
  poster: string;
  // Camera
  'camera-controls': string | boolean;
  'camera-orbit': string;
  'field-of-view': string;
  'min-camera-orbit': string;
  'max-camera-orbit': string;
  // Environment / lighting
  'environment-image': string;
  exposure: number | string;
  // Loading / UI
  loading: 'auto' | 'lazy' | 'eager';
  reveal: 'auto' | 'interaction' | 'manual';
  // HTML standard
  slot: string;
  class: string;
  className: string;
  id: string;
  style: React.CSSProperties;
  children: React.ReactNode;
  ref: React.Ref<ModelViewerElement>;
}>;

// React 19 compatible JSX namespace augmentation for <model-viewer> custom element
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerJSXProps;
    }
  }
}

export type { ModelViewerElement };
