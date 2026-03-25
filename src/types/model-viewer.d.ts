import type { ModelViewerElement } from '@google/model-viewer';

type ModelViewerJSXProps = Partial<{
  // Asset
  src: string;
  alt: string;
  poster: string;
  // Camera
  'camera-controls': boolean | '';
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
  // Events (React synthetic event form)
  onLoad: () => void;
  onError: (event: Event) => void;
  onProgress: (event: Event) => void;
  // HTML standard
  slot: string;
  className: string;
  id: string;
  style: React.CSSProperties;
  children: React.ReactNode;
  ref: React.Ref<ModelViewerElement>;
}>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerJSXProps;
    }
  }
}

export type { ModelViewerElement };
