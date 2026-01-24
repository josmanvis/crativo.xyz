"use client";

import React, { useEffect, useRef } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { IntroAnimation } from "@/remotion/IntroAnimation";

interface RemotionIntroProps {
  onEnded?: () => void;
}

const RemotionIntro: React.FC<RemotionIntroProps> = ({ onEnded }) => {
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleEnded = () => {
      onEnded?.();
    };

    player.addEventListener("ended", handleEnded);
    return () => {
      player.removeEventListener("ended", handleEnded);
    };
  }, [onEnded]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]">
      <Player
        ref={playerRef}
        component={IntroAnimation}
        durationInFrames={150}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        style={{ width: "100%", height: "100%" }}
        autoPlay
        controls={false}
        loop={false}
      />
    </div>
  );
};

export default RemotionIntro;
