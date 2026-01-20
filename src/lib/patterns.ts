export interface PatternParam {
  name: string;
  min: number;
  max: number;
  step: number;
  default: number;
  label: string;
}

export const PATTERN_PARAMS: Record<string, PatternParam[]> = {
  fbm: [
    { name: 'octaves', min: 1, max: 8, step: 1, default: 4, label: 'OCTAVES' },
    { name: 'lacunarity', min: 1, max: 4, step: 0.1, default: 2, label: 'LAC' },
    { name: 'gain', min: 0.1, max: 1, step: 0.05, default: 0.5, label: 'GAIN' },
  ],
  'domain-warp': [
    { name: 'scale', min: 0.1, max: 2, step: 0.1, default: 0.5, label: 'SCALE' },
    { name: 'complexity', min: 1, max: 6, step: 1, default: 3, label: 'CX' },
  ],
  ridged: [
    { name: 'scale', min: 0.1, max: 2, step: 0.1, default: 0.8, label: 'SCALE' },
    { name: 'sharpness', min: 0, max: 1, step: 0.05, default: 0.5, label: 'EDGE' },
  ],
  halftone: [
    { name: 'dotSize', min: 2, max: 20, step: 1, default: 6, label: 'DOT' },
    { name: 'angle', min: 0, max: 90, step: 1, default: 45, label: 'ANG' },
  ],
  hatching: [
    { name: 'density', min: 1, max: 10, step: 1, default: 3, label: 'DENS' },
    { name: 'angle', min: 0, max: 90, step: 1, default: 45, label: 'ANG' },
  ],
  moire: [
    { name: 'frequency', min: 0.1, max: 2, step: 0.1, default: 0.5, label: 'FREQ' },
    { name: 'rotation', min: 0, max: 360, step: 1, default: 30, label: 'ROT' },
  ],
  'gradient-bands': [
    { name: 'bandCount', min: 2, max: 16, step: 1, default: 5, label: 'BANDS' },
    { name: 'speed', min: 0.1, max: 2, step: 0.1, default: 0.5, label: 'SPD' },
  ],
  metaballs: [
    { name: 'ballCount', min: 2, max: 8, step: 1, default: 4, label: 'BALLS' },
    { name: 'radius', min: 20, max: 150, step: 5, default: 60, label: 'RAD' },
  ],
};

export const getPatternParams = (patternId: string): PatternParam[] => {
  return PATTERN_PARAMS[patternId] || [];
};
