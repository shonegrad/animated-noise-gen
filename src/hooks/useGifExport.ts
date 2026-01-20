import { useCallback, useRef } from 'react';
import GIF from 'gif.js';

export interface GifExportOptions {
  duration: number;
  resolution: '1080p' | '4K';
  exportFps: number;
  quality: number;
  onProgress: (progress: number) => void;
  onComplete: (blob: Blob) => void;
  onError: (error: Error) => void;
}

export function useGifExport() {
  const gifRef = useRef<GIF | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (gifRef.current) {
      gifRef.current.abort();
      gifRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const exportGif = useCallback(
    async (canvas: HTMLCanvasElement, options: GifExportOptions) => {
      abort();

      const { duration, resolution, exportFps, quality, onProgress, onComplete, onError } = options;

      abortControllerRef.current = new AbortController();

      try {
        const targetWidth = resolution === '4K' ? 3840 : 1920;
        const targetHeight = resolution === '4K' ? 2160 : 1080;
        const totalFrames = duration * exportFps;

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = targetWidth;
        offscreenCanvas.height = targetHeight;
        const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
        if (!offscreenCtx) {
          throw new Error('Failed to create offscreen context');
        }

        gifRef.current = new GIF({
          workers: 4,
          quality: Math.max(1, Math.min(20, 20 - quality)),
          width: targetWidth,
          height: targetHeight,
          workerScript: '/gif.worker.js',
        });

        const ctx = offscreenCtx;

        for (let i = 0; i < totalFrames; i++) {
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }

          const progress = (i / totalFrames) * 50;
          onProgress(progress);

          await new Promise((resolve) => setTimeout(resolve, 1000 / exportFps));

          ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          gifRef.current.addFrame(imageData, { delay: 1000 / exportFps, copy: true });
        }

        onProgress(50);

        gifRef.current.on('progress', (p: number) => {
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }
          const progress = 50 + p * 50;
          onProgress(Math.min(progress, 99));
        });

        gifRef.current.on('finished', (blob: Blob) => {
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }
          onProgress(100);
          onComplete(blob);
          gifRef.current = null;
        });

        gifRef.current.render();
      } catch (error) {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        const err = error instanceof Error ? error : new Error(String(error));
        onError(err);
        gifRef.current = null;
      }
    },
    [abort]
  );

  return { exportGif, abort };
}
