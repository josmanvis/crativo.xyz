import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

const TITLE = "crativo";
const SUBTITLE = "creative software portfolio";

const Letter: React.FC<{ char: string; index: number; total: number }> = ({
  char,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * 4;

  const scale = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 12,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        transform: `scale(${scale})`,
        opacity,
        marginLeft: index === 0 ? 0 : "-0.02em",
      }}
    >
      {char}
    </span>
  );
};

const DotGrid: React.FC = () => {
  const frame = useCurrentFrame();

  const gridOpacity = interpolate(frame, [0, 30], [0, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOutOpacity = interpolate(frame, [130, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dots: React.ReactNode[] = [];
  const spacing = 60;
  const cols = Math.ceil(1920 / spacing);
  const rows = Math.ceil(1080 / spacing);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={col * spacing + spacing / 2}
          cy={row * spacing + spacing / 2}
          r={1.5}
          fill="white"
        />
      );
    }
  }

  return (
    <AbsoluteFill style={{ opacity: gridOpacity * fadeOutOpacity }}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080">
        {dots}
      </svg>
    </AbsoluteFill>
  );
};

export const IntroAnimation: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtitle fade in (frames 70-100)
  const subtitleOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleTranslateY = interpolate(frame, [70, 90], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Final fade out (frames 130-150)
  const exitScale = interpolate(frame, [130, 150], [1, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [130, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Dot grid background */}
      <Sequence from={0} durationInFrames={150}>
        <DotGrid />
      </Sequence>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${exitScale})`,
          opacity: exitOpacity,
          position: "absolute",
          inset: 0,
        }}
      >
        {/* Title: staggered letter reveal */}
        <Sequence from={30} durationInFrames={120}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              inset: 0,
              flexDirection: "column",
            }}
          >
            <h1
              style={{
                fontSize: "7rem",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "white",
                fontFamily:
                  "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {TITLE.split("").map((char, i) => (
                <Letter key={i} char={char} index={i} total={TITLE.length} />
              ))}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "1.5rem",
                color: "#888",
                fontFamily:
                  "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 400,
                marginTop: "1.5rem",
                opacity: subtitleOpacity,
                transform: `translateY(${subtitleTranslateY}px)`,
                letterSpacing: "0.02em",
              }}
            >
              {SUBTITLE}
            </p>
          </div>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

export default IntroAnimation;
