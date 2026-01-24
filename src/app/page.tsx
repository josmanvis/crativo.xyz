"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const RemotionIntro = dynamic(() => import("@/components/RemotionIntro"), {
  ssr: false,
});

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const handleAnimationEnd = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      setShowIntro(false);
    }, 800);
  }, []);

  return (
    <>
      {showIntro && (
        <div
          className={`transition-opacity duration-700 ease-out ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <RemotionIntro onEnded={handleAnimationEnd} />
        </div>
      )}
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold tracking-tight">crativo</h1>
          <p className="text-xl text-gray-400 mt-4">
            Creative Software Portfolio
          </p>
          <p className="text-sm text-gray-600 mt-8">
            Projects coming soon...
          </p>
        </div>
      </main>
    </>
  );
}
