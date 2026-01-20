import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';

/**
 * Props for the ExportModal component.
 */
interface ExportModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback triggered when the user wants to export as video */
  onExportVideo: (
    duration: number,
    format: 'webm' | 'mp4',
    resolution: '1080p' | '4K',
    exportFps: number
  ) => void;
  /** Callback triggered when the user wants to export as GIF */
  onExportGif: (duration: number, resolution: '1080p' | '4K', exportFps: number) => void;
  /** Whether an export process is currently running */
  isExporting: boolean;
  /** Progress of the current export (0-100) */
  progress: number;
}

/**
 * A modal dialog for configuring and triggering animation exports.
 * Supports choosing format (GIF, WebM, MP4) and duration.
 */
export function ExportModal({
  isOpen,
  onClose,
  onExportVideo,
  onExportGif,
  isExporting,
  progress,
}: ExportModalProps) {
  const [duration, setDuration] = useState(3);
  const [format, setFormat] = useState<'gif' | 'webm' | 'mp4'>('webm');
  const [resolution, setResolution] = useState<'1080p' | '4K'>('1080p');
  const [exportFps, setExportFps] = useState(30);

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Animation</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose format, resolution, and frame rate for export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="duration">Duration</Label>
              <span className="text-sm text-gray-400">{duration}s</span>
            </div>
            <Slider
              id="duration"
              value={[duration]}
              onValueChange={(value: number[]) => setDuration(value[0])}
              min={1}
              max={10}
              step={1}
              disabled={isExporting}
            />
          </div>

          {/* Resolution */}
          <div className="space-y-3">
            <Label htmlFor="resolution">Resolution</Label>
            <Select
              value={resolution}
              onValueChange={(value: '1080p' | '4K') => setResolution(value)}
              disabled={isExporting}
            >
              <SelectTrigger id="resolution" className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="1080p" className="text-white">
                  1080p (1920x1080)
                </SelectItem>
                <SelectItem value="4K" className="text-white">
                  4K (3840x2160)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export FPS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="exportFps">Frame Rate</Label>
              <span className="text-sm text-gray-400">{exportFps} FPS</span>
            </div>
            <Slider
              id="exportFps"
              value={[exportFps]}
              onValueChange={(value: number[]) => setExportFps(value[0])}
              min={12}
              max={60}
              step={6}
              disabled={isExporting}
            />
          </div>

          {/* Format */}
          <div className="space-y-3">
            <Label htmlFor="format">Export Format</Label>
            <Select
              value={format}
              onValueChange={(value: 'gif' | 'webm' | 'mp4') => setFormat(value)}
              disabled={isExporting}
            >
              <SelectTrigger id="format" className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="gif" className="text-white">
                  Animated GIF
                </SelectItem>
                <SelectItem value="webm" className="text-white">
                  WebM Video
                </SelectItem>
                <SelectItem value="mp4" className="text-white">
                  MP4 Video
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Exporting...</span>
                <span className="text-gray-400">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={() => {
              if (format === 'gif') {
                onExportGif(duration, resolution, exportFps);
              } else {
                onExportVideo(duration, format, resolution, exportFps);
              }
            }}
            disabled={isExporting}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20"
            variant="outline"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              `Export ${format.toUpperCase()}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
