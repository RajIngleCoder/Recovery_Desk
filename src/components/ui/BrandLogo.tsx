import React from "react";
import Svg, { Path, Line } from "react-native-svg";
import { colors } from "@/constants";

interface BrandLogoProps {
  size?: number;
  sunColor?: string;
  heartbeatColor?: string;
}

export function BrandLogo({
  size = 32,
  sunColor = colors.primary,
  heartbeatColor = colors.textPrimary,
}: BrandLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Rising Half-Sun in #D9480F */}
      <Path d="M16 38 A16 16 0 0 1 48 38 Z" fill={sunColor} />
      {/* Minimal Sun Rays */}
      <Line x1="32" y1="12" x2="32" y2="17" stroke={sunColor} strokeWidth="3" strokeLinecap="round" />
      <Line x1="19" y1="17" x2="22.5" y2="20.5" stroke={sunColor} strokeWidth="3" strokeLinecap="round" />
      <Line x1="45" y1="17" x2="41.5" y2="20.5" stroke={sunColor} strokeWidth="3" strokeLinecap="round" />
      <Line x1="11" y1="29" x2="16" y2="30.5" stroke={sunColor} strokeWidth="3" strokeLinecap="round" />
      <Line x1="53" y1="29" x2="48" y2="30.5" stroke={sunColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Horizon Line with ECG Heartbeat Spike in #1F2933 */}
      <Path
        d="M4 38 L22 38 L25.5 35 L28 45 L32 16 L36 49 L39 35 L42 38 L60 38"
        stroke={heartbeatColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
