import { useRef, useState, useEffect } from 'react';
import { PixelNoiseGenerator, type PixelNoiseGeneratorRef } from './PixelNoiseGenerator';
import { ExportModal } from './ExportModal';
import { Pause, Play, Download, ChevronLeft, ChevronRight, FileVideo } from 'lucide-react';
import { toast } from 'sonner';
import type { UseNoiseSettingsResult } from '../hooks/useNoiseSettings';

interface RetroViewerProps {
  settings: UseNoiseSettingsResult;
}

export function RetroViewer({ settings }: RetroViewerProps) {
  const generatorRef = useRef<PixelNoiseGeneratorRef>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [actualFps, setActualFps] = useState(0);
  const [droppedFrames, setDroppedFrames] = useState(0);

  // Trackbar interaction
  const trackbarRef = useRef<HTMLDivElement>(null);
  const [isDraggingTrackbar, setIsDraggingTrackbar] = useState(false);

  // Export state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const updateFrameInfo = () => {
    if (generatorRef.current) {
      setCurrentFrame(generatorRef.current.getCurrentFrameIndex());
      setTotalFrames(generatorRef.current.getTotalFrames());
      setActualFps(generatorRef.current.getActualFps());
      setDroppedFrames(generatorRef.current.getDroppedFrames());
    }
  };

  const resetDroppedFrames = () => {
    if (generatorRef.current) {
      generatorRef.current.resetDroppedFrames();
      setDroppedFrames(0);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(updateFrameInfo, 100);
    return () => clearInterval(intervalId);
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

  // Export Logic (Moved from App.tsx)
  const handleExportGif = async (duration: number) => {
    const canvas = generatorRef.current?.getCanvas();
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(0);

    // Simulation
    const totalFramesToCapture = duration * settings.speed;
    const frames = [];

    for (let i = 0; i < totalFramesToCapture; i++) {
      setExportProgress((i / totalFramesToCapture) * 50);
      await new Promise((r) => setTimeout(r, 1000 / settings.speed));
      frames.push(canvas.toDataURL('image/png'));
    }

    const simulateEncoding = async () => {
      for (let i = 0; i <= 10; i++) {
        setExportProgress(50 + i * 5);
        await new Promise((r) => setTimeout(r, 200));
      }
    };

    await simulateEncoding();
    setIsExporting(false);
    setIsExportModalOpen(false);
    alert('Export simulation complete!');
  };

  const handleExportVideo = async (duration: number, format: 'webm' | 'mp4') => {
    const canvas = generatorRef.current?.getCanvas();
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(0);

    let mimeType = '';
    let extension = '';

    try {
      // ... (Same video export logic as before, simplified for brevity here but keeping core)
      if (format === 'webm') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9'))
          mimeType = 'video/webm;codecs=vp9';
        else if (MediaRecorder.isTypeSupported('video/webm')) mimeType = 'video/webm';
        extension = 'webm';
      } else {
        // MP4 checks...
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
          mimeType = 'video/mp4;codecs=h264';
          extension = 'mp4';
        } else {
          // fallback
          mimeType = 'video/webm';
          extension = 'webm';
          toast.info('MP4 not supported, using WebM');
        }
      }

      if (!mimeType) throw new Error('No supported video format');

      const stream = canvas.captureStream(Math.min(settings.speed, 60));
      const mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
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
        link.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportProgress(0);
        setIsExportModalOpen(false);
        toast.success(`Exported ${extension.toUpperCase()}`);
      };

      const wasPaused = isPaused;
      setIsPaused(false);
      await new Promise((r) => setTimeout(r, 100));
      mediaRecorder.start();

      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 100 / (duration * 10), 95));
      }, 100);

      setTimeout(() => {
        clearInterval(progressInterval);
        setExportProgress(100);
        mediaRecorder.stop();
        if (wasPaused) setTimeout(() => setIsPaused(true), 100);
      }, duration * 1000);
    } catch (error) {
      console.error(error);
      setIsExporting(false);
      toast.error('Failed to export');
    }
  };

  return (
    <div className="flex flex-col gap-4">
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
      </div>

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
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-mono text-zinc-400 tracking-[0.2em]"
          onClick={resetDroppedFrames}
        >
          {currentFrame}/{totalFrames} {actualFps > 0 && `· ${actualFps} FPS`}
          {droppedFrames > 0 && `· -${droppedFrames}`}
        </div>
      </div>

      {/* Playback & Export Menu */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/70 p-3 rounded-2xl border border-zinc-800/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            onClick={handleStepBackward}
            className="tv-button w-10 h-10"
            aria-label="Step Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="tv-button tv-button-primary w-14 h-10"
            aria-label={isPaused ? 'Play' : 'Pause'}
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
            aria-label="Step Forward"
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
            aria-label="Export Video"
          >
            <FileVideo className="w-3 h-3" />
            <span>REC</span>
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        <button onClick={() => settings.applyPreset('default')} className="tv-button h-12 text-xs">
          Default
        </button>
        <button onClick={() => settings.applyPreset('hacker')} className="tv-button h-12 text-xs">
          Hacker
        </button>
        <button onClick={() => settings.applyPreset('vcr')} className="tv-button h-12 text-xs">
          VCR Bad
        </button>
        <button onClick={() => settings.applyPreset('trip')} className="tv-button h-12 text-xs">
          Trip
        </button>
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
