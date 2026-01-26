'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AppsBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden"
    >
      <Link
        href="/apps"
        className="group block relative bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-2xl p-4 md:p-5 hover:border-yellow-500/50 transition-all duration-300"
      >
        {/* Animated gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
        
        {/* Floating emojis - pointer-events-none to prevent blocking clicks */}
        <div className="absolute top-2 right-4 text-2xl animate-bounce pointer-events-none" style={{ animationDelay: '0s' }}>🔥</div>
        <div className="absolute top-3 right-16 text-xl animate-bounce pointer-events-none" style={{ animationDelay: '0.2s' }}>⚡</div>
        <div className="absolute bottom-2 right-10 text-lg animate-bounce pointer-events-none" style={{ animationDelay: '0.4s' }}>🚀</div>
        
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* App icons preview */}
            <div className="hidden sm:flex items-center -space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm border-2 border-zinc-900 shadow-lg">
                pb
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm border-2 border-zinc-900 shadow-lg">
                tb
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm border-2 border-zinc-900 shadow-lg">
                ace
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-xs border-2 border-zinc-900">
                +4
              </div>
            </div>
            
            <div>
              <p className="text-white font-semibold text-base md:text-lg">
                Looking for my <span className="text-yellow-400">🔥 apps</span>?
              </p>
              <p className="text-zinc-400 text-sm">
                CLI tools, npm packages & more — all free
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-yellow-400 group-hover:text-yellow-300 transition-colors">
            <span className="hidden md:inline text-sm font-medium">Browse Apps</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
