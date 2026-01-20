import { useState, useRef, useEffect, RefObject } from 'react';
import type { PixelNoiseGeneratorRef } from '../components/PixelNoiseGenerator';

/** Playback state and controls */
export interface UsePlaybackResult {
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  currentFrame: number;
  totalFrames: number;
  isScrubbing: boolean;
  trackbarRef: RefObject<HTMLDivElement | null>;
  isDraggingTrackbar: boolean;
  handleStepForward: () => void;
  handleStepBackward: () => void;
  updateFramePosition: (value: number) => void;
  handleTrackbarMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleDownload: () => void;
}

/**
 * Custom hook for managing animation playback controls.
 * Handles frame navigation, timeline scrubbing, and screenshot download.
 */
export function usePlayback(
  generatorRef: RefObject<PixelNoiseGeneratorRef | null>
): UsePlaybackResult {
  const [isPaused, setIsPaused] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [isScrubbing] = useState(false);
  const [isDraggingTrackbar, setIsDraggingTrackbar] = useState(false);
  const trackbarRef = useRef<HTMLDivElement>(null);

  // Poll for frame information
  useEffect(() => {
    const updateFrameInfo = () => {
      if (generatorRef.current) {
        setCurrentFrame(generatorRef.current.getCurrentFrameIndex());
        setTotalFrames(generatorRef.current.getTotalFrames());
      }
    };

    const intervalId = setInterval(updateFrameInfo, 100);
    return () => clearInterval(intervalId);
  }, [generatorRef]);

  /** Captures the current frame as a PNG and downloads it. */
  const handleDownload = () => {
    const canvas = generatorRef.current?.getCanvas();
    if (canvas) {
      const link = document.createElement('a');
      link.download = `pixel-noise-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  /** Steps the animation forward by one frame. */
  const handleStepForward = () => {
    if (generatorRef.current) {
      generatorRef.current.stepForward();
      setIsPaused(true);
    }
  };

  /** Steps the animation backward by one frame. */
  const handleStepBackward = () => {
    if (generatorRef.current) {
      generatorRef.current.stepBackward();
      setIsPaused(true);
    }
  };

  /** Updates the current frame position when the timeline slider changes. */
  const updateFramePosition = (value: number) => {
    if (generatorRef.current) {
      generatorRef.current.seekToFrame(value);
      setCurrentFrame(value);
      setIsPaused(true);
    }
  };

  /** Handles trackbar mouse position to seek frame. */
  const handleTrackbarMove = (clientX: number) => {
    if (!trackbarRef.current) return;
    const rect = trackbarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newFrame = Math.floor(percentage * (totalFrames - 1));
    updateFramePosition(newFrame);
  };

  /** Initiates trackbar dragging. */
  const handleTrackbarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (trackbarRef.current) {
      setIsDraggingTrackbar(true);
      handleTrackbarMove(e.clientX);
    }
  };

  // Global mouse event handlers for trackbar dragging
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

  return {
    isPaused,
    setIsPaused,
    currentFrame,
    totalFrames,
    isScrubbing,
    trackbarRef,
    isDraggingTrackbar,
    handleStepForward,
    handleStepBackward,
    updateFramePosition,
    handleTrackbarMouseDown,
    handleDownload,
  };
}
