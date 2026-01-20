import { useRef, useState, useEffect, useCallback } from 'react';
import { PixelNoiseGenerator, type PixelNoiseGeneratorRef } from './PixelNoiseGenerator';
import { ExportModal } from './ExportModal';
import {
  Pause,
  Play,
  Download,
  ChevronLeft,
  ChevronRight,
  FileVideo,
  Maximize2,
  Minimize2,
  Keyboard,
} from 'lucide-react';
import { toast } from 'sonner';
import type { UseNoiseSettingsResult } from '../hooks/useNoiseSettings';
import { useGifExport } from '../hooks/useGifExport';

interface RetroViewerProps {
  settings: UseNoiseSettingsResult;
}

export function RetroViewer({ settings }: RetroViewerProps) {
  const generatorRef = useRef<PixelNoiseGeneratorRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [actualFps, setActualFps] = useState(0);
  const [droppedFrames, setDroppedFrames] = useState(0);

  // Live mode state
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Trackbar interaction
  const trackbarRef = useRef<HTMLDivElement>(null);
  const [isDraggingTrackbar, setIsDraggingTrackbar] = useState(false);

  // Export state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const { exportGif } = useGifExport();

  // MIDI state
  const midiAccessRef = useRef<MIDIAccess | null>(null);
  const [midiEnabled, setMidiEnabled] = useState(false);

  const updateFrameInfo = useCallback(() => {
    if (generatorRef.current) {
      setCurrentFrame(generatorRef.current.getCurrentFrameIndex());
      setTotalFrames(generatorRef.current.getTotalFrames());
      setActualFps(generatorRef.current.getActualFps());
      setDroppedFrames(generatorRef.current.getDroppedFrames());
    }
  }, []);

  const resetDroppedFrames = useCallback(() => {
    if (generatorRef.current) {
      generatorRef.current.resetDroppedFrames();
      setDroppedFrames(0);
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(updateFrameInfo, 100);
    return () => clearInterval(intervalId);
  }, [updateFrameInfo]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // MIDI initialization
  const initMidi = useCallback(async () => {
    if (!navigator.requestMIDIAccess) {
      toast.error('Web MIDI API not supported in this browser');
      return;
    }

    try {
      const access = await navigator.requestMIDIAccess({ sysex: false });
      midiAccessRef.current = access;

      access.inputs.forEach((input) => {
        input.onmidimessage = (event) => {
          const [status, note, velocity] = event.data || [];
          if (status === 144 && velocity > 0) {
            switch (note) {
              case 0:
                settings.setPattern('fbm');
                break;
              case 1:
                settings.setPattern('plasma');
                break;
              case 2:
                settings.setPattern('metaballs');
                break;
              case 3:
                settings.applyPreset('fbm-clouds');
                break;
              case 4:
                settings.applyPreset('metaballs-merge');
                break;
              case 5:
                settings.randomizeSeed();
                break;
              case 6:
                setIsPaused((prev) => !prev);
                break;
            }
          }
        };
      });

      setMidiEnabled(true);
      toast.success('MIDI controller connected');
    } catch (err) {
      console.error('MIDI init failed:', err);
      toast.error('Failed to initialize MIDI');
    }
  }, [settings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsPaused((prev) => !prev);
          break;
        case 'ArrowLeft':
          handleStepBackward();
          break;
        case 'ArrowRight':
          handleStepForward();
          break;
        case 'KeyR':
          settings.randomizeSeed();
          toast.info('New seed generated');
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyL':
          setIsLiveMode((prev) => !prev);
          break;
        case 'KeyM':
          if (!midiEnabled) initMidi();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, midiEnabled, initMidi, settings]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Trackbar logic
  const handleTrackbarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (trackbarRef.current) {
      setIsDraggingTrackbar(true);
      handleTrackbarMove(e.clientX);
    }
  };

  const handleTrackbarMove = (clientX: number) => {
    if (!trackbarRef.current) return;
    const rect = trackbarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newFrame = Math.floor(percentage * (totalFrames - 1));
    updateFramePosition(newFrame);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingTrackbar) {
        handleTrackbarMove(e.clientX);
      }
    };
    const handleGlobalMouseUp = () => {
      setIsDraggingTrackbar(false);
    };

    if (isDraggingTrackbar) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingTrackbar, totalFrames]);

  const updateFramePosition = (value: number) => {
    if (generatorRef.current) {
      generatorRef.current.seekToFrame(value);
      setCurrentFrame(value);
      setIsPaused(true);
    }
  };

  // Actions
  const handleStepForward = () => {
    if (generatorRef.current) {
      generatorRef.current.stepForward();
      setIsPaused(true);
    }
  };

  const handleStepBackward = () => {
    if (generatorRef.current) {
      generatorRef.current.stepBackward();
      setIsPaused(true);
    }
  };

  const handleDownload = () => {
    const canvas = generatorRef.current?.getCanvas();
    if (canvas) {
      const link = document.createElement('a');
      link.download = `pixel-noise-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  // GIF Export with gif.js
  const handleExportGif = useCallback(
    (duration: number, resolution: '1080p' | '4K', exportFps: number) => {
      const canvas = generatorRef.current?.getCanvas();
      if (!canvas) return;

      setIsExporting(true);
      setExportProgress(0);

      exportGif(canvas, {
        duration,
        resolution,
        exportFps,
        quality: 10,
        onProgress: setExportProgress,
        onComplete: (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `pixel-noise-${Date.now()}.gif`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setIsExporting(false);
          setIsExportModalOpen(false);
          setExportProgress(0);
          toast.success(`GIF exported (${resolution})`);
        },
        onError: (error) => {
          setIsExporting(false);
          setExportProgress(0);
          toast.error(`GIF export failed: ${error.message}`);
        },
      });
    },
    [exportGif]
  );

  // Video Export
  const handleExportVideo = useCallback(
    async (
      duration: number,
      format: 'webm' | 'mp4',
      resolution: '1080p' | '4K',
      exportFps: number
    ) => {
      const canvas = generatorRef.current?.getCanvas();
      if (!canvas) return;

      setIsExporting(true);
      setExportProgress(0);

      const targetWidth = resolution === '4K' ? 3840 : 1920;
      const targetHeight = resolution === '4K' ? 2160 : 1080;

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = targetWidth;
      offscreenCanvas.height = targetHeight;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      if (!offscreenCtx) {
        setIsExporting(false);
        toast.error('Failed to create export canvas');
        return;
      }

      let mimeType = '';
      let extension = '';

      try {
        if (format === 'webm') {
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            mimeType = 'video/webm;codecs=vp9';
          } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
            mimeType = 'video/webm;codecs=vp8';
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            mimeType = 'video/webm';
          }
          extension = 'webm';
        } else {
          const supportsMP4 =
            MediaRecorder.isTypeSupported('video/mp4') ||
            MediaRecorder.isTypeSupported('video/mp4;codecs=h264') ||
            MediaRecorder.isTypeSupported('video/mp4;codecs=avc1');

          if (supportsMP4) {
            if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
              mimeType = 'video/mp4;codecs=avc1';
            } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
              mimeType = 'video/mp4;codecs=h264';
            } else {
              mimeType = 'video/mp4';
            }
            extension = 'mp4';
          } else {
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
              mimeType = 'video/webm;codecs=vp9';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
              mimeType = 'video/webm';
            }
            extension = 'webm';
            toast.info('MP4 not supported. Exporting as WebM instead.', { duration: 4000 });
          }
        }

        if (!mimeType) throw new Error('No supported video format found');

        const stream = offscreenCanvas.captureStream(exportFps);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 5000000,
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `pixel-noise-${Date.now()}.${extension}`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setIsExporting(false);
          setExportProgress(0);
          setIsExportModalOpen(false);
          toast.success(
            `Exported ${extension.toUpperCase()} (${targetWidth}x${targetHeight} @ ${exportFps}fps)`
          );
        };

        mediaRecorder.onerror = () => {
          setIsExporting(false);
          setExportProgress(0);
          toast.error('Failed to export video');
        };

        const wasPaused = isPaused;
        setIsPaused(false);

        await new Promise((resolve) => setTimeout(resolve, 100));
        mediaRecorder.start();

        const totalFramesToCapture = duration * exportFps;
        let capturedFrames = 0;

        const captureInterval = setInterval(() => {
          offscreenCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
          capturedFrames++;
          setExportProgress((capturedFrames / totalFramesToCapture) * 90);
        }, 1000 / exportFps);

        setTimeout(() => {
          clearInterval(captureInterval);
          setExportProgress(100);
          mediaRecorder.stop();

          if (wasPaused) {
            setTimeout(() => setIsPaused(true), 100);
          }
        }, duration * 1000);
      } catch (error) {
        console.error('Error exporting video:', error);
        setIsExporting(false);
        setExportProgress(0);
        toast.error('Failed to export video');
      }
    },
    [isPaused]
  );

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-4 transition-all duration-300 ${
        isLiveMode ? 'fixed inset-0 z-50 bg-black p-0 m-0 rounded-none' : ''
      }`}
    >
      {/* Screen Container */}
      <div className="relative rounded-[20px] overflow-hidden border border-zinc-700/70 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] rounded-[20px] mix-blend-multiply"></div>
        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] opacity-40"></div>
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_10%,rgba(255,200,140,0.2),transparent_45%)]"></div>
        <div className="aspect-video w-full h-full relative">
          <PixelNoiseGenerator
            ref={generatorRef}
            {...settings}
            isPaused={isPaused}
            seed={settings.seed}
            patternParams={settings.patternParams}
          />
        </div>

        {/* Live mode overlay HUD */}
        {isLiveMode && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <span>FPS: {actualFps}</span>
            <span>•</span>
            <span>{settings.pattern}</span>
            <span>•</span>
            <span>{settings.colorMode}</span>
          </div>
        )}
      </div>

      {/* Controls (hidden in live mode when not hovering) */}
      <div
        className={`transition-all duration-300 ${
          isLiveMode
            ? 'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100'
            : ''
        }`}
      >
        {/* Timeline Trackbar */}
        <div
          ref={trackbarRef}
          className="h-7 bg-zinc-900/80 border border-zinc-700/80 rounded-full relative cursor-pointer group shadow-inner"
          onMouseDown={handleTrackbarMouseDown}
        >
          <div
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-amber-400/50 via-amber-500/40 to-emerald-300/40"
            style={{ width: `${totalFrames > 0 ? (currentFrame / (totalFrames - 1)) * 100 : 0}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] transform -translate-x-1/2 transition-transform duration-75 ease-linear"
            style={{ left: `${totalFrames > 0 ? (currentFrame / (totalFrames - 1)) * 100 : 0}%` }}
          >
            <div className="w-3.5 h-3.5 bg-amber-300 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-mono text-zinc-400 tracking-[0.2em] cursor-pointer"
            onClick={resetDroppedFrames}
          >
            {currentFrame}/{totalFrames} {actualFps > 0 && `· ${actualFps} FPS`}
            {droppedFrames > 0 && `· -${droppedFrames}`}
          </div>
        </div>

        {/* Playback & Export Menu */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/70 p-3 rounded-2xl border border-zinc-800/60 backdrop-blur mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStepBackward}
              className="tv-button w-10 h-10"
              aria-label="Step Back (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="tv-button tv-button-primary w-14 h-10"
              aria-label={isPaused ? 'Play (Space)' : 'Pause (Space)'}
            >
              {isPaused ? (
                <Play className="w-4 h-4 fill-current" />
              ) : (
                <Pause className="w-4 h-4 fill-current" />
              )}
            </button>
            <button
              onClick={handleStepForward}
              className="tv-button w-10 h-10"
              aria-label="Step Forward (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="tv-button px-3 h-10 gap-2"
              aria-label="Screenshot"
            >
              <Download className="w-3 h-3" />
              <span>SNAP</span>
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="tv-button px-3 h-10 gap-2 text-amber-200"
              aria-label="Export Video (REC)"
            >
              <FileVideo className="w-3 h-3" />
              <span>REC</span>
            </button>
          </div>

          {/* Live mode controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`tv-button px-3 h-10 gap-2 ${isLiveMode ? 'bg-amber-500/20 border-amber-500/50' : ''}`}
              aria-label="Live Mode (L)"
            >
              <Keyboard className="w-3 h-3" />
              <span>{isLiveMode ? 'LIVE' : 'LIVE'}</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="tv-button w-10 h-10"
              aria-label="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        {!isLiveMode && (
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 pt-3">
            <button
              onClick={() => settings.applyPreset('default')}
              className="tv-button h-12 text-xs"
            >
              Default
            </button>
            <button
              onClick={() => settings.applyPreset('hacker')}
              className="tv-button h-12 text-xs"
            >
              Hacker
            </button>
            <button onClick={() => settings.applyPreset('vcr')} className="tv-button h-12 text-xs">
              VCR Bad
            </button>
            <button onClick={() => settings.applyPreset('trip')} className="tv-button h-12 text-xs">
              Trip
            </button>
            <button
              onClick={() => settings.applyPreset('fbm-clouds')}
              className="tv-button h-12 text-xs"
            >
              Clouds
            </button>
            <button
              onClick={() => settings.applyPreset('fbm-terrain')}
              className="tv-button h-12 text-xs"
            >
              Terrain
            </button>
            <button
              onClick={() => settings.applyPreset('domain-warp-liquid')}
              className="tv-button h-12 text-xs"
            >
              Liquid
            </button>
            <button
              onClick={() => settings.applyPreset('ridged-mountains')}
              className="tv-button h-12 text-xs"
            >
              Mountains
            </button>
            <button
              onClick={() => settings.applyPreset('halftone-print')}
              className="tv-button h-12 text-xs"
            >
              Halftone
            </button>
            <button
              onClick={() => settings.applyPreset('hatching-sketch')}
              className="tv-button h-12 text-xs"
            >
              Hatching
            </button>
            <button
              onClick={() => settings.applyPreset('moire-interference')}
              className="tv-button h-12 text-xs"
            >
              Moire
            </button>
            <button
              onClick={() => settings.applyPreset('metaballs-merge')}
              className="tv-button h-12 text-xs"
            >
              Merge
            </button>
          </div>
        )}
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportVideo={handleExportVideo}
        onExportGif={handleExportGif}
        isExporting={isExporting}
        progress={exportProgress}
      />
    </div>
  );
}
