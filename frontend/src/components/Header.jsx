import React from 'react';
import { Droplets, Sparkles, Activity, ShieldCheck, Gauge } from 'lucide-react';

export default function Header({ currentView, onViewChange, isConnected }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 ring-2 ring-cyan-100">
              <Droplets className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 font-sans">
                  WATER<span className="text-cyan-600">WISE</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200/60">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block tracking-wide">
                Intelligent Daily Water Intake Forecasting
              </p>
            </div>
          </div>

          {/* Center / Navigation Segmented Switch */}
          <div className="flex items-center space-x-4">
            <div className="bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-inner flex items-center">
              <button
                type="button"
                onClick={() => onViewChange('simple')}
                className={`relative px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-1.5 ${
                  currentView === 'simple'
                    ? 'bg-white text-cyan-700 shadow-sm border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simple View</span>
              </button>

              <button
                type="button"
                onClick={() => onViewChange('expert')}
                className={`relative px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-1.5 ${
                  currentView === 'expert'
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Expert View</span>
              </button>
            </div>

            {/* Live API Status indicator */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-slate-600">
                {isConnected ? 'Model Server Ready' : 'Connecting...'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
