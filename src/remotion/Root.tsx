import React from "react";
import { Composition } from "remotion";
import { IntroAnimation } from "./IntroAnimation";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="IntroAnimation"
        component={IntroAnimation}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
