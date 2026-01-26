"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SplashContextType {
  hasShownSplash: boolean;
  markSplashShown: () => void;
}

const SplashContext = createContext<SplashContextType | null>(null);

export function SplashProvider({ children }: { children: ReactNode }) {
  // Initialize state by checking sessionStorage immediately (client-side only)
  const [hasShownSplash, setHasShownSplash] = useState(() => {
    // On server, default to false (will be corrected on hydration)
    if (typeof window === "undefined") return false;
    // On client, check sessionStorage immediately to avoid flicker
    return sessionStorage.getItem("crativo-splash-shown") === "true";
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Double-check sessionStorage on mount (handles edge cases)
    const sessionMarker = sessionStorage.getItem("crativo-splash-shown");
    
    // If marker exists, ensure splash state is true
    if (sessionMarker === "true" && !hasShownSplash) {
      setHasShownSplash(true);
    }
    
    setIsHydrated(true);
  }, [hasShownSplash]);

  const markSplashShown = () => {
    setHasShownSplash(true);
    sessionStorage.setItem("crativo-splash-shown", "true");
  };

  return (
    <SplashContext.Provider value={{ hasShownSplash: isHydrated ? hasShownSplash : true, markSplashShown }}>
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (!context) {
    throw new Error("useSplash must be used within a SplashProvider");
  }
  return context;
}
