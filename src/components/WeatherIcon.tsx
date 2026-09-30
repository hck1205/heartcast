import Svg, { Circle, G, Path } from 'react-native-svg';

import type { WeatherCode } from '@/types';

const Sun = ({ cx = 50, cy = 46, r = 20 }: { cx?: number; cy?: number; r?: number }) => (
  <G>
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * Math.PI) / 4;
      return (
        <Path
          key={i}
          d={`M${cx + Math.cos(a) * (r + 6)} ${cy + Math.sin(a) * (r + 6)} L${cx + Math.cos(a) * (r + 14)} ${cy + Math.sin(a) * (r + 14)}`}
          stroke="#FFB800"
          strokeWidth={5}
          strokeLinecap="round"
        />
      );
    })}
    <Circle cx={cx} cy={cy} r={r} fill="#FFD23F" stroke="#FFB800" strokeWidth={3} />
    <Circle cx={cx - 7} cy={cy - 3} r={2.5} fill="#7A4A00" />
    <Circle cx={cx + 7} cy={cy - 3} r={2.5} fill="#7A4A00" />
    <Path d={`M${cx - 7} ${cy + 6} Q${cx} ${cy + 13} ${cx + 7} ${cy + 6}`} stroke="#7A4A00" strokeWidth={2.5} fill="none" strokeLinecap="round" />
  </G>
);

const Cloud = ({ x = 0, y = 0, fill = '#FFFFFF', stroke = '#C9D3E3', face }: { x?: number; y?: number; fill?: string; stroke?: string; face?: 'calm' | 'sad' | 'grumpy' }) => (
  <G transform={`translate(${x} ${y})`}>
    <Path
      d="M22 70 C8 70 6 50 20 48 C20 32 40 26 48 38 C54 26 76 28 76 44 C90 44 94 68 78 70 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    {face === 'calm' && (
      <G>
        <Circle cx={40} cy={56} r={2.5} fill="#5B6784" />
        <Circle cx={58} cy={56} r={2.5} fill="#5B6784" />
        <Path d="M44 62 Q49 66 54 62" stroke="#5B6784" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </G>
    )}
    {face === 'sad' && (
      <G>
        <Circle cx={40} cy={56} r={2.5} fill="#3D4B6B" />
        <Circle cx={58} cy={56} r={2.5} fill="#3D4B6B" />
        <Path d="M44 65 Q49 60 54 65" stroke="#3D4B6B" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </G>
    )}
    {face === 'grumpy' && (
      <G>
        <Path d="M35 50 L43 54" stroke="#2B2250" strokeWidth={3} strokeLinecap="round" />
        <Path d="M63 50 L55 54" stroke="#2B2250" strokeWidth={3} strokeLinecap="round" />
        <Circle cx={40} cy={58} r={2.5} fill="#2B2250" />
        <Circle cx={58} cy={58} r={2.5} fill="#2B2250" />
        <Path d="M44 66 Q49 62 54 66" stroke="#2B2250" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </G>
    )}
  </G>
);

/** 귀여운 날씨 일러스트 (100x100) */
export function WeatherIcon({ code, size = 80 }: { code: WeatherCode; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {code === 'sunny' && <Sun />}
      {code === 'partly' && (
        <G>
          <Sun cx={62} cy={36} r={17} />
          <Cloud x={-6} y={14} face="calm" />
        </G>
      )}
      {code === 'cloudy' && (
        <G>
          <Cloud x={10} y={-6} fill="#E3E8F2" stroke="#B4BFD3" />
          <Cloud x={0} y={10} fill="#F2F5FA" stroke="#B4BFD3" face="calm" />
        </G>
      )}
      {code === 'rainy' && (
        <G>
          <Cloud x={2} y={-4} fill="#C7D3E8" stroke="#8FA2C4" face="sad" />
          {[26, 44, 62].map((x, i) => (
            <Path
              key={x}
              d={`M${x} ${74 + (i % 2) * 6} Q${x - 4} ${84 + (i % 2) * 6} ${x} ${88 + (i % 2) * 6} Q${x + 4} ${84 + (i % 2) * 6} ${x} ${74 + (i % 2) * 6} Z`}
              fill="#4FA3FF"
            />
          ))}
        </G>
      )}
      {code === 'stormy' && (
        <G>
          <Cloud x={2} y={-6} fill="#8A86B8" stroke="#5E5894" face="grumpy" />
          <Path d="M50 64 L40 82 L50 82 L44 98 L62 76 L52 76 L58 64 Z" fill="#FFD23F" stroke="#E6A800" strokeWidth={2} strokeLinejoin="round" />
          <Path d="M28 70 L25 80" stroke="#4FA3FF" strokeWidth={4} strokeLinecap="round" />
          <Path d="M74 70 L71 80" stroke="#4FA3FF" strokeWidth={4} strokeLinecap="round" />
        </G>
      )}
    </Svg>
  );
}

export { Cloud };
