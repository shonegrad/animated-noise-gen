import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tv2 } from 'lucide-react';
import { RetroKnob } from './RetroKnob';
import { RetroSelector } from './RetroSelector';
import type { UseNoiseSettingsResult } from '../hooks/useNoiseSettings';
import type { ColorMode, Pattern, Distortion } from './PixelNoiseGenerator';
import { getPatternParams } from '../lib/patterns';

interface ControlDeckProps {
  settings: UseNoiseSettingsResult;
}

export function ControlDeck({ settings }: ControlDeckProps) {
  const patternParams = getPatternParams(settings.pattern);

  // Local state for knob inputs to avoid stuttering while typing
  const [isEditingPixelSize, setIsEditingPixelSize] = useState(false);
  const [pixelSizeInput, setPixelSizeInput] = useState(settings.pixelSize.toString());

  const [isEditingSpeed, setIsEditingSpeed] = useState(false);
  const [speedInput, setSpeedInput] = useState(settings.speed.toString());

  const [isEditingIntensity, setIsEditingIntensity] = useState(false);
  const [intensityInput, setIntensityInput] = useState(
    settings.distortionParams.intensity.toString()
  );

  const [isEditingSecondary, setIsEditingSecondary] = useState(false);
  const [secondaryInput, setSecondaryInput] = useState(
    settings.distortionParams.secondary.toString()
  );

  return (
    <Card className="bg-zinc-950/70 border border-zinc-800/80 shadow-[0_25px_60px_rgba(0,0,0,0.45)] overflow-hidden h-full backdrop-blur">
      <CardHeader className="bg-gradient-to-r from-zinc-900/90 via-zinc-900/50 to-zinc-900/90 py-3 px-4 border-b border-zinc-800/70">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono uppercase tracking-[0.25em] text-zinc-300 flex items-center gap-2">
            <Tv2 className="w-4 h-4 text-amber-300" />
            Control Deck
          </CardTitle>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-discrete">
        {/* Row 1: Knobs */}
        <div className="grid grid-cols-2 gap-4 items-start pb-2">
          <RetroKnob
            label="SIZE"
            value={settings.pixelSize}
            min={1}
            max={100}
            onChange={settings.setPixelSize}
            unit="px"
            isEditing={isEditingPixelSize}
            setIsEditing={setIsEditingPixelSize}
            inputValue={pixelSizeInput}
            setInputValue={setPixelSizeInput}
          />
          <RetroKnob
            label="FPS"
            value={settings.speed}
            min={1}
            max={60}
            onChange={settings.setSpeed}
            unit="fps"
            isEditing={isEditingSpeed}
            setIsEditing={setIsEditingSpeed}
            inputValue={speedInput}
            setInputValue={setSpeedInput}
          />
        </div>

        {/* Selectors Section - Compact */}
        <div className="space-y-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/60">
          <RetroSelector
            label="Pattern"
            value={settings.pattern}
            options={[
              { value: 'pixels', label: 'Pixels' },
              { value: 'static', label: 'Static' },
              { value: 'scanlines', label: 'Scanlines' },
              { value: 'plasma', label: 'Plasma' },
              { value: 'cellular', label: 'Cellular' },
              { value: 'waves', label: 'Waves' },
              { value: 'diagonal', label: 'Diagonal' },
              { value: 'checkerboard', label: 'Checker' },
              { value: 'blocks', label: 'Blocks' },
              { value: 'glitch', label: 'Glitch' },
              { value: 'fbm', label: 'FBM' },
              { value: 'domain-warp', label: 'Domain' },
              { value: 'ridged', label: 'Ridged' },
              { value: 'halftone', label: 'Halftone' },
              { value: 'hatching', label: 'Hatching' },
              { value: 'moire', label: 'Moire' },
              { value: 'gradient-bands', label: 'Gradient' },
              { value: 'metaballs', label: 'Metaballs' },
            ]}
            onChange={(val) => settings.setPattern(val as Pattern)}
          />

          <RetroSelector
            label="Color Mode"
            value={settings.colorMode}
            options={[
              { value: 'monochrome', label: 'Mono' },
              { value: 'rgb', label: 'RGB' },
              { value: 'grayscale', label: 'Gray' },
              { value: 'neon', label: 'Neon' },
              { value: 'matrix', label: 'Matrix' },
              { value: 'fire', label: 'Fire' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'rainbow', label: 'Rainbow' },
              { value: 'retro', label: 'Retro' },
            ]}
            onChange={(val) => settings.setColorMode(val as ColorMode)}
          />
        </div>

        {/* Effects Section */}
        <div className="space-y-3 pt-1">
          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/60">
            <RetroSelector
              label="Distortion FX"
              value={settings.distortion}
              options={[
                { value: 'none', label: 'OFF' },
                { value: 'chromatic-aberration', label: 'Chromatic' },
                { value: 'scanlines', label: 'Scanlines' },
                { value: 'noise-overlay', label: 'Noise' },
                { value: 'pixelate', label: 'Pixelate' },
                { value: 'fisheye', label: 'Fisheye' },
                { value: 'cyberpunk', label: 'Cyber' },
                { value: 'vortex', label: 'Vortex' },
                { value: 'matrix', label: 'Matrix' },
              ]}
              onChange={(val) => settings.setDistortion(val as Distortion)}
            />
          </div>

          {/* Effect Parameters */}
          {settings.distortion !== 'none' && (
            <div className="grid grid-cols-2 gap-3 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
              <RetroKnob
                label="INTENSITY"
                value={settings.distortionParams.intensity}
                min={0}
                max={1}
                step={0.01}
                onChange={settings.setDistortionIntensity}
                isEditing={isEditingIntensity}
                setIsEditing={setIsEditingIntensity}
                inputValue={intensityInput}
                setInputValue={setIntensityInput}
              />
              <RetroKnob
                label="MOD"
                value={settings.distortionParams.secondary}
                min={0}
                max={1}
                step={0.01}
                onChange={settings.setDistortionSecondary}
                isEditing={isEditingSecondary}
                setIsEditing={setIsEditingSecondary}
                inputValue={secondaryInput}
                setInputValue={setSecondaryInput}
              />
            </div>
          )}

          {/* Pattern Params */}
          {patternParams.length > 0 && (
            <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
              <RetroKnob
                label={patternParams[0]?.label || 'PARAM 1'}
                value={settings.patternParams?.[patternParams[0].name] ?? patternParams[0].default}
                min={patternParams[0].min}
                max={patternParams[0].max}
                step={patternParams[0].step}
                onChange={(val) => settings.setPatternParam?.(patternParams[0].name, val)}
              />
              {patternParams[1] && (
                <RetroKnob
                  label={patternParams[1]?.label || 'PARAM 2'}
                  value={
                    settings.patternParams?.[patternParams[1].name] ?? patternParams[1].default
                  }
                  min={patternParams[1].min}
                  max={patternParams[1].max}
                  step={patternParams[1].step}
                  onChange={(val) => settings.setPatternParam?.(patternParams[1].name, val)}
                />
              )}
              {patternParams[2] && (
                <RetroKnob
                  label={patternParams[2]?.label || 'PARAM 3'}
                  value={
                    settings.patternParams?.[patternParams[2].name] ?? patternParams[2].default
                  }
                  min={patternParams[2].min}
                  max={patternParams[2].max}
                  step={patternParams[2].step}
                  onChange={(val) => settings.setPatternParam?.(patternParams[2].name, val)}
                />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
