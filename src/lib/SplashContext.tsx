"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SplashContextType {
  hasShownSplash: boolean;
  markSplashShown: () => void;
}

const SplashContext = createContext<SplashContextType | null>(null);

export function SplashProvider({ children }: { children: ReactNode }) {
  const [hasShownSplash, setHasShownSplash] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check if this is a fresh page load or client-side navigation
    // Fresh loads won't have the session marker set yet
    const sessionMarker = sessionStorage.getItem("crativo-splash-shown");
    
    // If marker exists, splash was already shown this session
    if (sessionMarker === "true") {
      setHasShownSplash(true);
    }
    
    setIsHydrated(true);
  }, []);

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
