export interface ChairModel {
  name: string;
  src: string;
  alt: string;
  initialCameraOrbit?: string;
}

export interface ColorOption {
  id: string;
  label: string;
  hex: string;
  isActive: boolean;
}

export interface MaterialPreset {
  id: string;
  label: string;
  thumbnail: string;
  textureUrl: string | null;
  roughness: number;
  metalness: number;
  isActive: boolean;
}
