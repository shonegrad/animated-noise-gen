import { useState, RefObject } from 'react';
import { toast } from 'sonner';
import type { PixelNoiseGeneratorRef } from '../components/PixelNoiseGenerator';

/** Export state and handlers */
export interface UseExportResult {
  isExporting: boolean;
  exportProgress: number;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  handleExportGif: (duration: number) => Promise<void>;
  handleExportVideo: (duration: number, format: 'webm' | 'mp4') => Promise<void>;
}

/**
 * Custom hook for managing animation export functionality.
 * Extracts GIF and video export logic from App component.
 */
export function useExport(
  generatorRef: RefObject<PixelNoiseGeneratorRef | null>,
  speed: number,
  isPaused: boolean,
  setIsPaused: (paused: boolean) => void
): UseExportResult {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  /**
   * Records and exports the animation as a GIF.
   * Currently simulates the export process.
   */
  const handleExportGif = async (duration: number): Promise<void> => {
    const canvas = generatorRef.current?.getCanvas();
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(0);

    const totalFramesToCapture = duration * speed;
    const frames: string[] = [];

    for (let i = 0; i < totalFramesToCapture; i++) {
      setExportProgress((i / totalFramesToCapture) * 50);
      await new Promise((r) => setTimeout(r, 1000 / speed));
      frames.push(canvas.toDataURL('image/png'));
    }

    // Simulate encoding
    for (let i = 0; i <= 10; i++) {
      setExportProgress(50 + i * 5);
      await new Promise((r) => setTimeout(r, 200));
    }

    setIsExporting(false);
    setIsExportModalOpen(false);
    toast.info('GIF export simulation complete. Full implementation requires gif.js worker.');
  };

  /**
   * Records and exports the animation as a video (WebM or MP4).
   */
  const handleExportVideo = async (duration: number, format: 'webm' | 'mp4'): Promise<void> => {
    const canvas = generatorRef.current?.getCanvas();
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(0);

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
          // Fallback to WebM
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            mimeType = 'video/webm;codecs=vp9';
          } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
            mimeType = 'video/webm;codecs=vp8';
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            mimeType = 'video/webm';
          }
          extension = 'webm';
          toast.info('MP4 not supported. Exporting as WebM instead.', { duration: 4000 });
        }
      }

      if (!mimeType) {
        throw new Error('No supported video format found');
      }

      const stream = canvas.captureStream(Math.min(speed, 60));
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000,
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
        setIsExportModalOpen(false);
        toast.success(`Video exported as ${extension.toUpperCase()}`);
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

      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 100 / (duration * 10), 95));
      }, 100);

      setTimeout(() => {
        clearInterval(progressInterval);
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
  };

  return {
    isExporting,
    exportProgress,
    isExportModalOpen,
    setIsExportModalOpen,
    handleExportGif,
    handleExportVideo,
  };
}
