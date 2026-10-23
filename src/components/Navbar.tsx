import React from 'react';
import { Video, ShieldAlert, Sparkles, Smartphone, Code2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  emergencyStop: boolean;
  onToggleEmergencyStop: () => void;
  onOpenNewJob: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  emergencyStop,
  onToggleEmergencyStop,
  onOpenNewJob,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          RF
        </div>
        <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          ReelFlow Studio
        </span>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'dashboard' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'pages' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          100 Pages
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'studio' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          AI Prompt Studio
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'queue' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Queue & Reviews
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'calendar' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Schedule & Published
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'budget' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Budget & Audit
        </button>

        <button
          onClick={() => setActiveTab('emulator')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'emulator' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android App</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'docs' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code & Specs</span>
        </button>
      </nav>

      {/* Zone 3: Primary action button & Emergency Freeze */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleEmergencyStop}
          title={emergencyStop ? 'Emergency stop active. Click to resume.' : 'Click to halt all generation and publishing jobs'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            emergencyStop
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-rose-400 border border-slate-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{emergencyStop ? 'EMERGENCY STOPPED' : 'Emergency Stop'}</span>
        </button>

        <button
          onClick={onOpenNewJob}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Create AI Reel</span>
        </button>
      </div>
    </header>
  );
};
