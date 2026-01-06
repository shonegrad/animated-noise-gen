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
  open: boolean;
  /** Callback to change the open state */
  onOpenChange: (open: boolean) => void;
  /** Callback triggered when the user confirms export */
  onExport: (duration: number, format: 'gif' | 'webm' | 'mp4') => void;
  /** Whether an export process is currently running */
  isExporting: boolean;
  /** Progress of the current export (0-100) */
  exportProgress: number;
}

/**
 * A modal dialog for configuring and triggering animation exports.
 * Supports choosing format (GIF, WebM, MP4) and duration.
 */
export function ExportModal({
  open,
  onOpenChange,
  onExport,
  isExporting,
  exportProgress,
}: ExportModalProps) {
  const [duration, setDuration] = useState(3);
  const [format, setFormat] = useState<'gif' | 'webm' | 'mp4'>('gif');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Animation</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose format and settings for your export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="duration">Duration</Label>
              <span className="text-sm text-gray-400">{duration}s</span>
            </div>
            <Slider
              id="duration"
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              min={1}
              max={10}
              step={1}
              disabled={isExporting}
            />
          </div>

          {/* Format */}
          <div className="space-y-3">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={(value: any) => setFormat(value)} disabled={isExporting}>
              <SelectTrigger id="format" className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="gif" className="text-white">Animated GIF</SelectItem>
                <SelectItem value="webm" className="text-white">WebM Video</SelectItem>
                <SelectItem value="mp4" className="text-white">MP4 Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Exporting...</span>
                <span className="text-gray-400">{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={() => onExport(duration, format)}
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