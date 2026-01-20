import { useNoiseSettings } from './hooks/useNoiseSettings';
import { ControlDeck } from './components/ControlDeck';
import { RetroViewer } from './components/RetroViewer';

export default function App() {
  const settings = useNoiseSettings();

  return (
    <div className="min-h-screen text-neutral-200 font-sans selection:bg-amber-500/30 overflow-x-hidden retro-theme">
      <main className="container mx-auto px-4 py-6 lg:py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Visual Output & Main Controls */}
          <div className="lg:col-span-8">
            <RetroViewer settings={settings} />
          </div>

          {/* Right Column: Control Panel */}
          <div className="lg:col-span-4">
            <ControlDeck settings={settings} />
          </div>
        </div>
      </main>
    </div>
  );
}
