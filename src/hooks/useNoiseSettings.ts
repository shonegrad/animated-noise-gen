import { useState, useCallback } from 'react';
import type { ColorMode, Pattern, Distortion } from '../components/PixelNoiseGenerator';

/** All noise generation settings */
export interface NoiseSettings {
  pixelSize: number;
  speed: number;
  colorMode: ColorMode;
  pattern: Pattern;
  distortion: Distortion;
  distortionParams: {
    intensity: number;
    secondary: number;
  };
  /** Deterministic seed for reproducible output */
  seed?: number;
  /** Pattern-specific parameters */
  patternParams?: Record<string, number>;
}

/** Settings state with setters */
export interface UseNoiseSettingsResult extends NoiseSettings {
  setPixelSize: (value: number) => void;
  setSpeed: (value: number) => void;
  setColorMode: (value: ColorMode) => void;
  setPattern: (value: Pattern) => void;
  setDistortion: (value: Distortion) => void;
  setDistortionIntensity: (value: number) => void;
  setDistortionSecondary: (value: number) => void;
  setPatternParam: (name: string, value: number) => void;
  setSeed: (value: number | undefined) => void;
  randomizeSeed: () => void;
  applyPreset: (preset: 'default' | 'hacker' | 'vcr' | 'trip') => void;
}

/** Default settings */
const DEFAULT_SETTINGS: NoiseSettings = {
  pixelSize: 10,
  speed: 30,
  colorMode: 'monochrome',
  pattern: 'pixels',
  distortion: 'none',
  distortionParams: {
    intensity: 0.5,
    secondary: 0.5,
  },
  seed: undefined,
};

/**
 * Custom hook for managing all noise generator settings.
 * Provides state, setters, and preset management.
 */
export function useNoiseSettings(
  initialSettings: Partial<NoiseSettings> = {}
): UseNoiseSettingsResult {
  const initial = { ...DEFAULT_SETTINGS, ...initialSettings };

  const [pixelSize, setPixelSize] = useState(initial.pixelSize);
  const [speed, setSpeed] = useState(initial.speed);
  const [colorMode, setColorMode] = useState<ColorMode>(initial.colorMode);
  const [pattern, setPattern] = useState<Pattern>(initial.pattern);
  const [distortion, setDistortion] = useState<Distortion>(initial.distortion);
  const [distortionParams, setDistortionParams] = useState(initial.distortionParams);
  const [seed, setSeedState] = useState<number | undefined>(initial.seed);

  const setSeed = useCallback((val: number | undefined) => {
    setSeedState(val);
  }, []);

  const randomizeSeed = useCallback(() => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    setSeedState(buf[0] || 1);
  }, []);

  const setDistortionIntensity = useCallback((val: number) => {
    setDistortionParams((p) => ({ ...p, intensity: val }));
  }, []);

  const setDistortionSecondary = useCallback((val: number) => {
    setDistortionParams((p) => ({ ...p, secondary: val }));
  }, []);

  const [patternParams, setPatternParamsState] = useState<Record<string, number>>({});

  const setPatternParam = useCallback((name: string, value: number) => {
    setPatternParamsState((p) => ({ ...p, [name]: value }));
  }, []);

  const applyPreset = useCallback(
    (preset: 'default' | 'hacker' | 'vcr' | 'trip') => {
      switch (preset) {
        case 'default':
          setPattern('pixels');
          setColorMode('monochrome');
          setDistortion('none');
          setSpeed(30);
          break;
        case 'hacker':
          setPattern('scanlines');
          setColorMode('matrix');
          setDistortion('matrix');
          setSpeed(24);
          break;
        case 'vcr':
          setPattern('static');
          setColorMode('rgb');
          setDistortion('chromatic-aberration');
          setSpeed(30);
          break;
        case 'trip':
          setPattern('plasma');
          setColorMode('neon');
          setDistortion('cyberpunk');
          setSpeed(30);
          break;
      }
    },
    [setPattern, setColorMode, setDistortion, setSpeed]
  );

  return {
    pixelSize,
    speed,
    colorMode,
    pattern,
    distortion,
    distortionParams,
    seed,
    patternParams,
    setPixelSize,
    setSpeed,
    setColorMode,
    setPattern,
    setDistortion,
    setDistortionIntensity,
    setDistortionSecondary,
    setPatternParam,
    setSeed,
    randomizeSeed,
    applyPreset,
  };
}
