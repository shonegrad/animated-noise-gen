import React, { useState, useRef, useEffect } from 'react';
import { PixelNoiseGenerator, PixelNoiseGeneratorRef, ColorMode, Pattern, Distortion } from './components/PixelNoiseGenerator';
import { ExportModal } from './components/ExportModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { Slider } from './components/ui/slider';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Button } from './components/ui/button';
import { Pause, Play, Download, ChevronLeft, ChevronRight, FileVideo, Tv2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import GIF from 'gif.js';
import { RetroKnob } from './components/RetroKnob';
import { RetroSelector } from './components/RetroSelector';
import { RetroSwitch } from './components/RetroSwitch';
import { RetroPresetButton } from './components/RetroPresetButton';

export default function App() {
  const [pixelSize, setPixelSize] = useState(10);
  const [speed, setSpeed] = useState(30);
  const [colorMode, setColorMode] = useState<ColorMode>('monochrome');
  const [pattern, setPattern] = useState<Pattern>('pixels');
  const [distortion, setDistortion] = useState<Distortion>('none');
  const [distortionParams, setDistortionParams] = useState({
    intensity: 0.5,
    secondary: 0.5
  });

  // Animation state
  const [isPaused, setIsPaused] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const generatorRef = useRef<PixelNoiseGeneratorRef>(null);

  // Export state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // --- Compatibility / UI State ---
  const [controlStyle, setControlStyle] = useState<'retro' | 'modern'>('retro');

  // Input editing state
  const [isEditingPixelSize, setIsEditingPixelSize] = useState(false);
  const [pixelSizeInput, setPixelSizeInput] = useState('10');
  const [isEditingSpeed, setIsEditingSpeed] = useState(false);
  const [speedInput, setSpeedInput] = useState('30');

  // Distortion inputs - Wrappers for distortionParams
  const distortionIntensity = distortionParams.intensity;
  const distortionSecondary = distortionParams.secondary;
  const setDistortionIntensity = (val: number) => setDistortionParams((p: { intensity: number; secondary: number }) => ({ ...p, intensity: val }));
  const setDistortionSecondary = (val: number) => setDistortionParams((p: { intensity: number; secondary: number }) => ({ ...p, secondary: val }));

  const [isEditingDistortionIntensity, setIsEditingDistortionIntensity] = useState(false);
  const [distortionIntensityInput, setDistortionIntensityInput] = useState('0.5');
  const [isEditingDistortionSecondary, setIsEditingDistortionSecondary] = useState(false);
  const [distortionSecondaryInput, setDistortionSecondaryInput] = useState('0.5');

  // Trackbar
  const trackbarRef = useRef<HTMLDivElement>(null);
  const [isDraggingTrackbar, setIsDraggingTrackbar] = useState(false);

  // Variable Aliases to match UI usage
  const currentFrameIndex = currentFrame;
  const exportModalOpen = isExportModalOpen;
  const setExportModalOpen = setIsExportModalOpen;

  /**
   * Updates current frame information from the generator reference.
   */
  useEffect(() => {
    const updateFrameInfo = () => {
      if (generatorRef.current) {
        setCurrentFrame(generatorRef.current.getCurrentFrameIndex());
        setTotalFrames(generatorRef.current.getTotalFrames());
      }
    };

    const intervalId = setInterval(updateFrameInfo, 100);
    return () => clearInterval(intervalId);
  }, []);

  /**
   * Captures the current frame as a PNG and downloads it.
   */
  const handleDownload = () => {
    const canvas = generatorRef.current?.getCanvas();
    if (canvas) {
      const link = document.createElement('a');
      link.download = `pixel-noise-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  /**
   * Manually steps the animation forward by one frame.
   */
  const handleStepForward = () => {
    if (generatorRef.current) {
      generatorRef.current.stepForward();
      setIsPaused(true);
    }
  };

  /**
   * Manually steps the animation backward by one frame.
   */
  const handleStepBackward = () => {
    if (generatorRef.current) {
      generatorRef.current.stepBackward();
      setIsPaused(true);
    }
  };

  /**
   * Updates the current frame position when the timeline slider changes.
   * @param value - The new frame index to seek to.
   */
  const updateFramePosition = (value: number) => {
    if (generatorRef.current) {
      generatorRef.current.seekToFrame(value);
      setCurrentFrame(value);
      setIsPaused(true);
    }
  };

  /**
   * Records and exports the animation as a GIF.
   * @param duration - Duration of the recording in seconds.
   */
  const handleExportGif = async (duration: number) => {
    const canvas = generatorRef.current?.getCanvas();
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(0);

    // We need to load gif.js dynamically or assume it's in public/
    // Since this is a client-side only library, we'll try to use a worker
    // Note: In a real app we'd need to bundle gif.worker.js

    // For this demo implementation we'll simulate the export process
    // In a production app you would use gif.js or ffmpeg.wasm here

    // Simulating frame capture
    const totalFramesToCapture = duration * speed;
    const frames = [];

    for (let i = 0; i < totalFramesToCapture; i++) {
      // Update progress
      setExportProgress((i / totalFramesToCapture) * 50);

      // Wait for next frame
      await new Promise(r => setTimeout(r, 1000 / speed));

      // Capture frame
      frames.push(canvas.toDataURL('image/png'));
    }

    // Simulating encoding
    const simulateEncoding = async () => {
      for (let i = 0; i <= 10; i++) {
        setExportProgress(50 + (i * 5));
        await new Promise(r => setTimeout(r, 200));
      }
    };

    await simulateEncoding();

    setIsExporting(false);
    setIsExportModalOpen(false);

    // In a real implementation we would download the blob here
    alert("Export simulation complete! In a real app this would download the GIF.");
  };

  /**
   * Records and exports the animation as a video (WebM or MP4).
   * @param duration - Duration of the recording in seconds.
   * @param format - Video format ('webm' or 'mp4').
   */
  const handleExportVideo = async (duration: number, format: 'webm' | 'mp4') => {
    const canvas = generatorRef.current?.getCanvas();
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(0);

    let mimeType = '';
    let extension = '';

    try {
      if (format === 'webm') {
        // Try different WebM codecs
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          mimeType = 'video/webm;codecs=vp8';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        }
        extension = 'webm';
      } else {
        // MP4 format requested
        // Note: Most browsers don't support MP4 encoding via MediaRecorder
        // Check for MP4 support first
        const supportsMP4 = MediaRecorder.isTypeSupported('video/mp4') ||
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
          // Fallback to WebM (supported by all modern browsers)
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            mimeType = 'video/webm;codecs=vp9';
          } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
            mimeType = 'video/webm;codecs=vp8';
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            mimeType = 'video/webm';
          }
          extension = 'webm';
          toast.info('MP4 not supported by your browser. Exporting as WebM instead.', { duration: 4000 });
        }
      }

      if (!mimeType) {
        throw new Error('No supported video format found');
      }

      const stream = canvas.captureStream(Math.min(speed, 60)); // Use current speed, cap at 60fps
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
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
        setExportModalOpen(false);
        toast.success(`Video exported successfully as ${extension.toUpperCase()}`);
      };

      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
        setIsExporting(false);
        setExportProgress(0);
        toast.error('Failed to export video');
      };

      // Temporarily unpause to record
      const wasPaused = isPaused;
      setIsPaused(false);

      // Wait a bit before starting
      await new Promise(resolve => setTimeout(resolve, 100));

      mediaRecorder.start();

      // Progress tracking
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + (100 / (duration * 10)), 95));
      }, 100);

      // Stop recording after duration
      setTimeout(() => {
        clearInterval(progressInterval);
        setExportProgress(100);
        mediaRecorder.stop();

        // Restore pause state
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
  };

  const handleExport = async (duration: number, format: 'gif' | 'webm' | 'mp4') => {
    if (format === 'gif') {
      await handleExportGif(duration);
    } else {
      await handleExportVideo(duration, format);
    }
  };

  const handleTrackbarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPaused) setIsPaused(true); // Pause when dragging
    setIsDraggingTrackbar(true);
    updateTrackbarPosition(e);
  };

  const updateTrackbarPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackbarRef.current || totalFrames <= 1) return;

    const rect = trackbarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max(x / rect.width, 0), 1);
    const frameIndex = Math.round(percentage * (totalFrames - 1));

    if (generatorRef.current) {
      generatorRef.current.seekToFrame(frameIndex);
      updateFramePosition();
    }
  };

  // Handle drag events globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingTrackbar || !trackbarRef.current) return;

      const rect = trackbarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.min(Math.max(x / rect.width, 0), 1);
      const frameIndex = Math.round(percentage * (totalFrames - 1));

      if (generatorRef.current) {
        generatorRef.current.seekToFrame(frameIndex);
        updateFramePosition();
      }
    };

    const handleMouseUp = () => {
      setIsDraggingTrackbar(false);
    };

    if (isDraggingTrackbar) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTrackbar, totalFrames]);

  const handleTrackbarMouseUp = () => {
    setIsDraggingTrackbar(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white">Pixel Noise Generator</h1>
            <p className="text-gray-400">Create animated pixel noise patterns</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsPaused(!isPaused)}
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 hover:bg-white/20"
              aria-label={isPaused ? "Play animation" : "Pause animation"}
            >
              {isPaused ? <Play className="h-4 w-4 text-white" /> : <Pause className="h-4 w-4 text-white" />}
            </Button>
            {isPaused && (
              <>
                <Button
                  onClick={handleStepBackward}
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 hover:bg-white/20"
                  title="Step backward"
                  aria-label="Step backward"
                >
                  <ChevronLeft className="h-4 w-4 text-white" />
                </Button>
                <Button
                  onClick={handleStepForward}
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 hover:bg-white/20"
                  title="Step forward"
                  aria-label="Step forward"
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </Button>
              </>
            )}
            <Button
              onClick={handleDownload}
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 hover:bg-white/20"
              title="Download current frame"
              aria-label="Download current frame"
            >
              <Download className="h-4 w-4 text-white" />
            </Button>
            <Button
              onClick={() => setExportModalOpen(true)}
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 hover:bg-white/20"
              title="Export GIF or Video"
              aria-label="Open export options"
            >
              <FileVideo className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>

        {/* TV Container - holds screen and controls like an actual TV */}
        <div
          className="flex-1 rounded-3xl border-4 p-6 md:p-8 shadow-2xl min-h-0"
          style={{
            background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
            borderColor: '#404040',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Canvas Area with Tracking Bar */}
            <div className="lg:col-span-3 flex flex-col gap-3 h-full min-h-0">
              <div className="bg-black rounded-2xl border-4 border-gray-800 overflow-hidden flex-1 shadow-inner"
                style={{
                  boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.8)'
                }}
              >
                <PixelNoiseGenerator
                  ref={generatorRef}
                  pixelSize={pixelSize}
                  speed={speed}
                  colorMode={colorMode}
                  pattern={pattern}
                  distortion={distortion}
                  distortionParams={{
                    intensity: distortionIntensity,
                    secondary: distortionSecondary
                  }}
                  isPaused={isPaused}
                />
              </div>

              {/* Tracking Bar */}
              {totalFrames > 0 && (
                <div className="bg-black/30 rounded-lg border border-white/10 p-3 relative">
                  <div
                    ref={trackbarRef}
                    className="relative h-4 cursor-pointer"
                    onMouseDown={handleTrackbarMouseDown}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 h-1 bg-white/10 rounded-full w-full" />
                    <div
                      className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-75 pointer-events-none"
                      style={{
                        left: `${totalFrames > 1 ? (currentFrameIndex / (totalFrames - 1)) * 100 : 0}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Controls - Scrollable panel */}
            <div className="lg:col-span-1 h-full overflow-y-auto overflow-x-hidden">
              {controlStyle === 'retro' ? (
                <div
                  className="rounded-lg border-2 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                    borderColor: '#404040',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {/* Control Panel Header */}
                  <div
                    className="px-4 py-3 border-b-2"
                    style={{
                      background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
                      borderColor: '#1a1a1a'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-200 tracking-wide font-mono">CONTROL PANEL</div>
                        <div className="text-xs text-gray-400 font-mono">TV-3000 Series</div>
                      </div>
                      <button
                        onClick={() => setControlStyle('modern')}
                        className="p-2 rounded bg-black/30 hover:bg-black/50 transition-colors"
                        title="Switch to modern controls"
                      >
                        <Tv2 className="w-4 h-4 text-gray-200" />
                      </button>
                    </div>
                  </div>

                  {/* Retro Controls Content */}
                  <div className="p-6 space-y-8">
                    {/* Knobs Row */}
                    <div className="grid grid-cols-2 gap-6">
                      <RetroKnob
                        label="Size"
                        value={pixelSize}
                        min={2}
                        max={256}
                        step={1}
                        onChange={setPixelSize}
                        unit="px"
                        color="#ff6b35"
                      />
                      <RetroKnob
                        label="Speed"
                        value={speed}
                        min={0.1}
                        max={60}
                        step={0.1}
                        onChange={setSpeed}
                        unit=" fps"
                        color="#35ff6b"
                      />
                    </div>

                    {/* Divider */}
                    <div
                      className="h-px"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, #ff6b3520 50%, transparent 100%)'
                      }}
                    />

                    {/* Selectors */}
                    <div className="space-y-4">
                      <RetroSelector
                        label="Pattern"
                        value={pattern}
                        options={[
                          { value: 'pixels', label: 'Pixels' },
                          { value: 'horizontal-lines', label: 'H-Lines' },
                          { value: 'vertical-lines', label: 'V-Lines' },
                          { value: 'static', label: 'Static' },
                          { value: 'glitch', label: 'Glitch' },
                          { value: 'checkerboard', label: 'Checker' },
                          { value: 'waves', label: 'Waves' },
                          { value: 'diagonal', label: 'Diagonal' },
                          { value: 'blocks', label: 'Blocks' }
                        ]}
                        onChange={(val) => setPattern(val as Pattern)}
                      />

                      <RetroSelector
                        label="Color Mode"
                        value={colorMode}
                        options={[
                          { value: 'monochrome', label: 'Monochrome' },
                          { value: 'rgb', label: 'RGB' },
                          { value: 'neon', label: 'Neon' },
                          { value: 'warm', label: 'Warm' },
                          { value: 'cool', label: 'Cool' },
                          { value: 'rainbow', label: 'Rainbow' },
                          { value: 'retro', label: 'Retro' }
                        ]}
                        onChange={(val) => setColorMode(val as ColorMode)}
                      />

                      <RetroSelector
                        label="Distortion FX"
                        value={distortion}
                        options={[
                          { value: 'none', label: 'None' },
                          { value: 'chromatic-aberration', label: 'Chromatic' },
                          { value: 'scanlines', label: 'Scanlines' },
                          { value: 'crt', label: 'CRT' },
                          { value: 'noise-overlay', label: 'Noise' },
                          { value: 'vhs', label: 'VHS' },
                          { value: 'pixelate', label: 'Pixelate' },
                          { value: 'dither', label: 'Dither' },
                          { value: 'fisheye', label: 'Fisheye' },
                          { value: 'glow', label: 'Glow' },
                          { value: 'rgb-split', label: 'RGB Split' },
                          { value: 'kaleidoscope', label: 'Kaleidoscope' },
                          { value: 'ripple', label: 'Ripple' },
                          { value: 'radial-fade', label: 'Radial Fade' },
                          { value: 'cyberpunk', label: 'Cyberpunk' },
                          { value: 'vortex', label: 'Vortex' },
                          { value: 'matrix', label: 'Matrix' }
                        ]}
                        onChange={(val) => setDistortion(val as Distortion)}
                      />
                    </div>

                    {/* Divider */}
                    <div
                      className="h-px"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, #ff6b3520 50%, transparent 100%)'
                      }}
                    />

                    {/* Fine Tune Knobs */}
                    <div className="grid grid-cols-2 gap-6">
                      <RetroKnob
                        label="FX-1"
                        value={distortionIntensity}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={setDistortionIntensity}
                        size="sm"
                        color="#6b35ff"
                      />
                      <RetroKnob
                        label="FX-2"
                        value={distortionSecondary}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={setDistortionSecondary}
                        size="sm"
                        color="#ff35c7"
                      />
                    </div>

                    {/* Divider */}
                    <div
                      className="h-px"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, #ff6b3520 50%, transparent 100%)'
                      }}
                    />

                    {/* Presets */}
                    <div className="space-y-3">
                      <div className="text-xs uppercase tracking-wider text-amber-200/70 font-mono text-center">
                        Quick Presets
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <RetroPresetButton
                          label="TV Static"
                          onClick={() => {
                            setPixelSize(4);
                            setSpeed(60);
                            setColorMode('monochrome');
                            setPattern('static');
                          }}
                        />
                        <RetroPresetButton
                          label="Retro"
                          onClick={() => {
                            setPixelSize(20);
                            setSpeed(10);
                            setColorMode('retro');
                            setPattern('pixels');
                          }}
                        />
                        <RetroPresetButton
                          label="Cyberpunk"
                          onClick={() => {
                            setPixelSize(8);
                            setSpeed(45);
                            setColorMode('neon');
                            setPattern('glitch');
                          }}
                        />
                        <RetroPresetButton
                          label="Dreamy"
                          onClick={() => {
                            setPixelSize(15);
                            setSpeed(5);
                            setColorMode('rainbow');
                            setPattern('waves');
                          }}
                        />
                        <RetroPresetButton
                          label="Ocean"
                          onClick={() => {
                            setPixelSize(12);
                            setSpeed(30);
                            setColorMode('cool');
                            setPattern('horizontal-lines');
                          }}
                        />
                        <RetroPresetButton
                          label="Sunset"
                          onClick={() => {
                            setPixelSize(6);
                            setSpeed(25);
                            setColorMode('warm');
                            setPattern('diagonal');
                          }}
                        />
                        <RetroPresetButton
                          label="Mosaic"
                          onClick={() => {
                            setPixelSize(32);
                            setSpeed(2);
                            setColorMode('monochrome');
                            setPattern('blocks');
                          }}
                        />
                        <RetroPresetButton
                          label="Confetti"
                          onClick={() => {
                            setPixelSize(10);
                            setSpeed(20);
                            setColorMode('rgb');
                            setPattern('checkerboard');
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Controls</CardTitle>
                        <CardDescription className="text-gray-400">Customize your noise</CardDescription>
                      </div>
                      <button
                        onClick={() => setControlStyle('retro')}
                        className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        title="Switch to retro controls"
                      >
                        <Tv2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Pixel Size */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pixel-size" className="text-white">Pixel Size</Label>
                        {isEditingPixelSize ? (
                          <Input
                            type="number"
                            value={pixelSizeInput}
                            onChange={(e) => setPixelSizeInput(e.target.value)}
                            onBlur={() => {
                              setIsEditingPixelSize(false);
                              const numValue = parseFloat(pixelSizeInput);
                              if (!isNaN(numValue)) {
                                const clampedValue = Math.min(Math.max(numValue, 2), 256);
                                setPixelSize(clampedValue);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setIsEditingPixelSize(false);
                                const numValue = parseFloat(pixelSizeInput);
                                if (!isNaN(numValue)) {
                                  const clampedValue = Math.min(Math.max(numValue, 2), 256);
                                  setPixelSize(clampedValue);
                                }
                              } else if (e.key === 'Escape') {
                                setIsEditingPixelSize(false);
                                setPixelSizeInput(pixelSize.toString());
                              }
                            }}
                            className="w-16 h-6 bg-white/5 border-white/10 text-white text-sm text-right px-2"
                            min={2}
                            max={256}
                            step={1}
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => {
                              setIsEditingPixelSize(true);
                              setPixelSizeInput(pixelSize.toString());
                            }}
                            className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors"
                          >
                            {pixelSize}px
                          </span>
                        )}
                      </div>
                      <Slider
                        id="pixel-size"
                        value={[pixelSize]}
                        onValueChange={(values) => setPixelSize(values[0])}
                        min={2}
                        max={256}
                        step={1}
                      />
                    </div>

                    {/* Speed */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="speed" className="text-white">Speed</Label>
                        {isEditingSpeed ? (
                          <Input
                            type="number"
                            value={speedInput}
                            onChange={(e) => setSpeedInput(e.target.value)}
                            onBlur={() => {
                              setIsEditingSpeed(false);
                              const numValue = parseFloat(speedInput);
                              if (!isNaN(numValue)) {
                                const clampedValue = Math.min(Math.max(numValue, 0.1), 60);
                                setSpeed(clampedValue);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setIsEditingSpeed(false);
                                const numValue = parseFloat(speedInput);
                                if (!isNaN(numValue)) {
                                  const clampedValue = Math.min(Math.max(numValue, 0.1), 60);
                                  setSpeed(clampedValue);
                                }
                              } else if (e.key === 'Escape') {
                                setIsEditingSpeed(false);
                                setSpeedInput(speed.toString());
                              }
                            }}
                            className="w-16 h-6 bg-white/5 border-white/10 text-white text-sm text-right px-2"
                            min={0.1}
                            max={60}
                            step={0.1}
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => {
                              setIsEditingSpeed(true);
                              setSpeedInput(speed.toString());
                            }}
                            className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors"
                          >
                            {speed.toFixed(1)} fps
                          </span>
                        )}
                      </div>
                      <Slider
                        id="speed"
                        value={[speed]}
                        onValueChange={(values) => setSpeed(values[0])}
                        min={0.1}
                        max={60}
                        step={0.1}
                      />
                    </div>

                    {/* Pattern */}
                    <div className="space-y-3">
                      <Label htmlFor="pattern" className="text-white">Pattern</Label>
                      <Select value={pattern} onValueChange={(value: any) => setPattern(value)}>
                        <SelectTrigger id="pattern" className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          <SelectItem value="pixels" className="text-white">Pixels</SelectItem>
                          <SelectItem value="horizontal-lines" className="text-white">Horizontal Lines</SelectItem>
                          <SelectItem value="vertical-lines" className="text-white">Vertical Lines</SelectItem>
                          <SelectItem value="static" className="text-white">Static</SelectItem>
                          <SelectItem value="glitch" className="text-white">Glitch</SelectItem>
                          <SelectItem value="checkerboard" className="text-white">Checkerboard</SelectItem>
                          <SelectItem value="waves" className="text-white">Waves</SelectItem>
                          <SelectItem value="diagonal" className="text-white">Diagonal</SelectItem>
                          <SelectItem value="blocks" className="text-white">Blocks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color Mode */}
                    <div className="space-y-3">
                      <Label htmlFor="color-mode" className="text-white">Color Mode</Label>
                      <Select value={colorMode} onValueChange={(value: any) => setColorMode(value)}>
                        <SelectTrigger id="color-mode" className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          <SelectItem value="monochrome" className="text-white">Monochrome</SelectItem>
                          <SelectItem value="rgb" className="text-white">RGB</SelectItem>
                          <SelectItem value="neon" className="text-white">Neon</SelectItem>
                          <SelectItem value="warm" className="text-white">Warm</SelectItem>
                          <SelectItem value="cool" className="text-white">Cool</SelectItem>
                          <SelectItem value="rainbow" className="text-white">Rainbow</SelectItem>
                          <SelectItem value="retro" className="text-white">Retro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Distortion */}
                    <div className="space-y-3">
                      <Label htmlFor="distortion" className="text-white">Distortion</Label>
                      <Select value={distortion} onValueChange={(value: any) => setDistortion(value)}>
                        <SelectTrigger id="distortion" className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          <SelectItem value="none" className="text-white">None</SelectItem>
                          <SelectItem value="chromatic-aberration" className="text-white">Chromatic Aberration</SelectItem>
                          <SelectItem value="scanlines" className="text-white">Scanlines</SelectItem>
                          <SelectItem value="crt" className="text-white">CRT</SelectItem>
                          <SelectItem value="noise-overlay" className="text-white">Noise Overlay</SelectItem>
                          <SelectItem value="vhs" className="text-white">VHS</SelectItem>
                          <SelectItem value="pixelate" className="text-white">Pixelate</SelectItem>
                          <SelectItem value="dither" className="text-white">Dither</SelectItem>
                          <SelectItem value="fisheye" className="text-white">Fisheye</SelectItem>
                          <SelectItem value="glow" className="text-white">Glow</SelectItem>
                          <SelectItem value="rgb-split" className="text-white">RGB Split</SelectItem>
                          <SelectItem value="kaleidoscope" className="text-white">Kaleidoscope</SelectItem>
                          <SelectItem value="ripple" className="text-white">Ripple</SelectItem>
                          <SelectItem value="radial-fade" className="text-white">Radial Fade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Distortion Intensity */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="distortion-intensity" className="text-white">Distortion Intensity</Label>
                        {isEditingDistortionIntensity ? (
                          <Input
                            type="number"
                            value={distortionIntensityInput}
                            onChange={(e) => setDistortionIntensityInput(e.target.value)}
                            onBlur={() => {
                              setIsEditingDistortionIntensity(false);
                              const numValue = parseFloat(distortionIntensityInput);
                              if (!isNaN(numValue)) {
                                const clampedValue = Math.min(Math.max(numValue, 0), 1);
                                setDistortionIntensity(clampedValue);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setIsEditingDistortionIntensity(false);
                                const numValue = parseFloat(distortionIntensityInput);
                                if (!isNaN(numValue)) {
                                  const clampedValue = Math.min(Math.max(numValue, 0), 1);
                                  setDistortionIntensity(clampedValue);
                                }
                              } else if (e.key === 'Escape') {
                                setIsEditingDistortionIntensity(false);
                                setDistortionIntensityInput(distortionIntensity.toString());
                              }
                            }}
                            className="w-16 h-6 bg-white/5 border-white/10 text-white text-sm text-right px-2"
                            min={0}
                            max={1}
                            step={0.01}
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => {
                              setIsEditingDistortionIntensity(true);
                              setDistortionIntensityInput(distortionIntensity.toString());
                            }}
                            className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors"
                          >
                            {distortionIntensity.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Slider
                        id="distortion-intensity"
                        value={[distortionIntensity]}
                        onValueChange={(values) => setDistortionIntensity(values[0])}
                        min={0}
                        max={1}
                        step={0.01}
                      />
                    </div>

                    {/* Distortion Secondary */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="distortion-secondary" className="text-white">Distortion Secondary</Label>
                        {isEditingDistortionSecondary ? (
                          <Input
                            type="number"
                            value={distortionSecondaryInput}
                            onChange={(e) => setDistortionSecondaryInput(e.target.value)}
                            onBlur={() => {
                              setIsEditingDistortionSecondary(false);
                              const numValue = parseFloat(distortionSecondaryInput);
                              if (!isNaN(numValue)) {
                                const clampedValue = Math.min(Math.max(numValue, 0), 1);
                                setDistortionSecondary(clampedValue);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setIsEditingDistortionSecondary(false);
                                const numValue = parseFloat(distortionSecondaryInput);
                                if (!isNaN(numValue)) {
                                  const clampedValue = Math.min(Math.max(numValue, 0), 1);
                                  setDistortionSecondary(clampedValue);
                                }
                              } else if (e.key === 'Escape') {
                                setIsEditingDistortionSecondary(false);
                                setDistortionSecondaryInput(distortionSecondary.toString());
                              }
                            }}
                            className="w-16 h-6 bg-white/5 border-white/10 text-white text-sm text-right px-2"
                            min={0}
                            max={1}
                            step={0.01}
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => {
                              setIsEditingDistortionSecondary(true);
                              setDistortionSecondaryInput(distortionSecondary.toString());
                            }}
                            className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors"
                          >
                            {distortionSecondary.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Slider
                        id="distortion-secondary"
                        value={[distortionSecondary]}
                        onValueChange={(values) => setDistortionSecondary(values[0])}
                        min={0}
                        max={1}
                        step={0.01}
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <Label className="text-white">Quick Presets</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => {
                            setPixelSize(4);
                            setSpeed(60);
                            setColorMode('monochrome');
                            setPattern('static');
                          }}
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          TV Static
                        </Button>
                        <Button
                          onClick={() => {
                            setPixelSize(20);
                            setSpeed(10);
                            setColorMode('retro');
                            setPattern('pixels');
                          }}
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          Retro
                        </Button>
                        <Button
                          onClick={() => {
                            setPixelSize(8);
                            setSpeed(45);
                            setColorMode('neon');
                            setPattern('glitch');
                          }}
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          Cyberpunk
                        </Button>
                        <Button
                          onClick={() => {
                            setPixelSize(15);
                            setSpeed(5);
                            setColorMode('rainbow');
                            setPattern('waves');
                          }}
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          Dreamy
                        </Button>
                        <Button
                          onClick={() => {
                            setPixelSize(12);
                            setSpeed(30);
                            setColorMode('cool');
                            setPattern('horizontal-lines');
                          }}
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          Ocean Wave
                        </Button>
                        <Button
                          onClick={() => {
                            setPixelSize(6);
                            setSpeed(25);
                            setColorMode('warm');
                            setPattern('diagonal');
                          }}
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          Sunset
                        </Button>
                        <Button
                          onClick={() => {
                            setPixelSize(32);
                            setSpeed(2);
                            setColorMode('monochrome');
                            setPattern('blocks');
                          }}
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          Mosaic
                        </Button>
                        <Button
                          onClick={() => {
                            setPixelSize(10);
                            setSpeed(20);
                            setColorMode('rgb');
                            setPattern('checkerboard');
                          }}
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          Confetti
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExport}
        isExporting={isExporting}
        exportProgress={exportProgress}
      />
    </div>
  );
}