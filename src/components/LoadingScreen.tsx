import React from 'react';
import { Vault, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  // Motivational quotes
  const quotes = [
    "Preserving memories, empowering futures.",
    "Your legacy is loading...",
    "Every moment counts."
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500 flex items-center justify-center">
      <div className="relative w-full max-w-md mx-auto px-4 py-10 sm:px-8 sm:py-12 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-2xl border border-white/20">
        {/* Animated gradient border ring */}
        <div className="absolute -inset-1 rounded-3xl pointer-events-none z-0 animate-border-glow" style={{background: 'conic-gradient(from 180deg at 50% 50%, #fbbf24, #a78bfa, #f43f5e, #fbbf24)'}}></div>
        <div className="relative z-10 text-center">
          <div className="relative mb-8 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 mx-auto animate-float shadow-2xl border-4 border-white/30">
              <Vault className="h-12 w-12 text-white" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-spin border-t-white"></div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-lg tracking-tight">Vault of Legacy</h1>
          <p className="text-white/80 mb-4 text-base sm:text-lg font-medium">{message}</p>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span className="text-sm text-white/80">Initializing secure connection...</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-6">
            <div className="h-3 bg-gradient-to-r from-orange-400 via-purple-500 to-primary-500 animate-progress-bar rounded-full" style={{width: '80%'}}></div>
          </div>
          {/* Motivational quote */}
          <div className="mb-6">
            <span className="text-xs sm:text-sm text-white/70 italic">{randomQuote}</span>
          </div>
          {/* Animated bouncing dots */}
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-3 w-3 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
// Add to your global CSS (e.g., index.css or tailwind.css):
// .animate-border-glow { animation: border-glow 3s linear infinite; }
// @keyframes border-glow { 0%{filter:blur(0px);} 50%{filter:blur(4px);} 100%{filter:blur(0px);} }
// .animate-progress-bar { animation: progress-bar-move 2s cubic-bezier(.4,0,.2,1) infinite; }
// @keyframes progress-bar-move { 0%{width:0;} 80%{width:80%;} 100%{width:0;} }
}