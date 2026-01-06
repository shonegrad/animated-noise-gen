# Animated Pixel Noise Generator

A retro-styled, browser-based tool for creating procedural pixel noise animations. Based on the [original design](https://www.figma.com/design/LZiP8JQJRObP5MDh4IXVhr/Animated-Pixel-Noise-Generator) by the Figma team.

## Features

- **Procedural Pattern Generation**: Choose from multiple patterns including Pixels, Lines, Static, Glitch, Checkerboard, Waves, and more.
- **Color Modes**: Select from various palettes like Monochrome, RGB, Neon, Warm, Cool, Rainbow, and Retro.
- **Distortion Effects**: Apply post-processing effects such as CRT scanlines, Chromatic Aberration, VHS tracking, Fisheye, and Glow.
- **Animation Controls**:
  - Adjustable playback speed.
  - Frame skipping (Step forward/backward).
  - Timeline scrubbing.
  - Pause/Play toggle.
- **Export Options**:
  - Download single frames as PNG.
  - Export animations as GIF.
  - Export video as WebM or MP4.
- **Retro UI**: A fully styled interface with custom knobs, sliders, and CRT visual aesthetics.

## Project Structure

```
src/
├── components/
│   ├── PixelNoiseGenerator.tsx  # Core canvas rendering engine
│   ├── RetroKnob.tsx            # Custom rotary input component
│   ├── ExportModal.tsx          # Export configuration dialog
│   └── ui/                      # Reusable UI components (buttons, sliders, etc.)
├── App.tsx                      # Main application state and layout
└── index.css                    # Global styles and Tailwind imports
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Building

Build the project for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage Guide

1. **Pattern & Color**: Use the selectors on the left to choose your base visual style.
2. **Distortion**: Enable effects like 'CRT' or 'Scanlines' and adjust their intensity using the knobs below.
3. **Animation**:
   - Use the **Speed** slider to control frame rate.
   - Click the **Pause** button to freeze the animation.
   - Drag the timeline slider to scrub through past frames.
4. **Export**:
   - Click **Download Frame** for a static PNG of the current view.
   - Click **Export Animation** to open the modal where you can choose duration and format (GIF/Video).

## License

This project is open source.