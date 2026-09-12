import React from 'react';
import Svg, {
  Circle,
  Line,
  Path,
  Polyline,
  Polygon,
  Rect,
} from 'react-native-svg';

export type IconName =
  | 'home'
  | 'play'
  | 'pause'
  | 'library'
  | 'settings'
  | 'plus'
  | 'search'
  | 'more'
  | 'moreVertical'
  | 'previous'
  | 'next'
  | 'volume'
  | 'volumeMute'
  | 'shuffle'
  | 'repeat'
  | 'heart'
  | 'heartFill'
  | 'queue'
  | 'folder'
  | 'music'
  | 'trash'
  | 'close'
  | 'back'
  | 'chevronRight'
  | 'chevronDown'
  | 'chevronUp'
  | 'clock'
  | 'disc'
  | 'edit'
  | 'check'
  | 'info'
  | 'refresh'
  | 'scan'
  | 'playlist'
  | 'list';

type Node =
  | { t: 'path'; d: string; fill?: boolean }
  | { t: 'polygon'; points: string; fill?: boolean }
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { t: 'circle'; cx: number; cy: number; r: number; fill?: boolean }
  | { t: 'polyline'; points: string }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx?: number; fill?: boolean };

const ICONS: Record<IconName, Node[]> = {
  home: [
    { t: 'path', d: 'M3 9.5 12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-5V15h-5v6.5H4.5A1.5 1.5 0 0 1 3 20Z' },
  ],
  play: [{ t: 'polygon', points: '7 4.5 19 12 7 19.5 7 4.5', fill: true }],
  pause: [
    { t: 'rect', x: 6.5, y: 4.5, w: 3.5, h: 15, rx: 1, fill: true },
    { t: 'rect', x: 14, y: 4.5, w: 3.5, h: 15, rx: 1, fill: true },
  ],
  library: [
    { t: 'rect', x: 3, y: 3, w: 18, h: 4.5, rx: 1.5 },
    { t: 'path', d: 'M3 10.5h18' },
    { t: 'path', d: 'M3 10.5v7A1.5 1.5 0 0 0 4.5 19h6' },
    { t: 'path', d: 'M21 10.5v7a1.5 1.5 0 0 1-1.5 1.5H15' },
  ],
  settings: [
    {
      t: 'circle',
      cx: 12,
      cy: 12,
      r: 3.2,
    },
    {
      t: 'path',
      d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
    },
  ],
  plus: [
    { t: 'line', x1: 12, y1: 5, x2: 12, y2: 19 },
    { t: 'line', x1: 5, y1: 12, x2: 19, y2: 12 },
  ],
  search: [
    { t: 'circle', cx: 11, cy: 11, r: 7 },
    { t: 'line', x1: 21, y1: 21, x2: 16.2, y2: 16.2 },
  ],
  more: [
    { t: 'circle', cx: 5, cy: 12, r: 1, fill: true },
    { t: 'circle', cx: 12, cy: 12, r: 1, fill: true },
    { t: 'circle', cx: 19, cy: 12, r: 1, fill: true },
  ],
  moreVertical: [
    { t: 'circle', cx: 12, cy: 5, r: 1, fill: true },
    { t: 'circle', cx: 12, cy: 12, r: 1, fill: true },
    { t: 'circle', cx: 12, cy: 19, r: 1, fill: true },
  ],
  previous: [
    { t: 'polygon', points: '6.5 4 15.5 12 6.5 20 6.5 4' },
    { t: 'line', x1: 17.5, y1: 4, x2: 17.5, y2: 20 },
  ],
  next: [
    { t: 'polygon', points: '17.5 4 8.5 12 17.5 20 17.5 4' },
    { t: 'line', x1: 6.5, y1: 4, x2: 6.5, y2: 20 },
  ],
  volume: [
    { t: 'polygon', points: '11 5.5 6.5 9.5 3 9.5 3 14.5 6.5 14.5 11 18.5 11 5.5' },
    { t: 'path', d: 'M15.5 8.6a5 5 0 0 1 0 6.8' },
  ],
  volumeMute: [
    { t: 'polygon', points: '11 5.5 6.5 9.5 3 9.5 3 14.5 6.5 14.5 11 18.5 11 5.5' },
    { t: 'line', x1: 23, y1: 9.5, x2: 15.5, y2: 17 },
    { t: 'line', x1: 15.5, y1: 9.5, x2: 23, y2: 17 },
  ],
  shuffle: [
    { t: 'polyline', points: '16 3.5 20.5 3.5 20.5 8' },
    { t: 'line', x1: 4.5, y1: 19.5, x2: 20.5, y2: 3.5 },
    { t: 'polyline', points: '20.5 16 20.5 20.5 16 20.5' },
    { t: 'line', x1: 14.5, y1: 14.5, x2: 20.5, y2: 20.5 },
    { t: 'line', x1: 4.5, y1: 4.5, x2: 9, y2: 9 },
  ],
  repeat: [
    { t: 'polyline', points: '17 1.5 21 5.5 17 9.5' },
    { t: 'path', d: 'M3 11.5V9.5a4 4 0 0 1 4-4h14' },
    { t: 'polyline', points: '7 22.5 3 18.5 7 14.5' },
    { t: 'path', d: 'M21 12.5v2a4 4 0 0 1-4 4H3' },
  ],
  heart: [
    {
      t: 'path',
      d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    },
  ],
  heartFill: [
    {
      t: 'path',
      d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
      fill: true,
    },
  ],
  queue: [
    { t: 'line', x1: 8.5, y1: 6, x2: 21, y2: 6 },
    { t: 'line', x1: 8.5, y1: 12, x2: 21, y2: 12 },
    { t: 'line', x1: 8.5, y1: 18, x2: 21, y2: 18 },
    { t: 'line', x1: 3.5, y1: 6, x2: 4, y2: 6 },
    { t: 'line', x1: 3.5, y1: 12, x2: 4, y2: 12 },
    { t: 'line', x1: 3.5, y1: 18, x2: 4, y2: 18 },
  ],
  list: [
    { t: 'line', x1: 8.5, y1: 7, x2: 21, y2: 7 },
    { t: 'line', x1: 8.5, y1: 12, x2: 21, y2: 12 },
    { t: 'line', x1: 8.5, y1: 17, x2: 21, y2: 17 },
    { t: 'line', x1: 3.5, y1: 7, x2: 4, y2: 7 },
    { t: 'line', x1: 3.5, y1: 12, x2: 4, y2: 12 },
    { t: 'line', x1: 3.5, y1: 17, x2: 4, y2: 17 },
  ],
  playlist: [
    { t: 'rect', x: 3.5, y: 3.5, w: 17, h: 17, rx: 3 },
    { t: 'polygon', points: '11 9.5 16.5 12.5 11 15.5 11 9.5' },
  ],
  folder: [
    { t: 'path', d: 'M22 19.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h5l2 2.5h9a2 2 0 0 1 2 2z' },
  ],
  music: [
    { t: 'path', d: 'M9 18V5l12-2v13' },
    { t: 'circle', cx: 6, cy: 18, r: 3 },
    { t: 'circle', cx: 18, cy: 16, r: 3 },
  ],
  trash: [
    { t: 'polyline', points: '3.5 6.5 5.5 6.5 20.5 6.5' },
    { t: 'path', d: 'M19 6.5v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-14m3 0V4.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' },
  ],
  close: [
    { t: 'line', x1: 18, y1: 6, x2: 6, y2: 18 },
    { t: 'line', x1: 6, y1: 6, x2: 18, y2: 18 },
  ],
  back: [{ t: 'polyline', points: '15 18 9 12 15 6' }],
  chevronRight: [{ t: 'polyline', points: '9 18 15 12 9 6' }],
  chevronDown: [{ t: 'polyline', points: '6 9 12 15 18 9' }],
  chevronUp: [{ t: 'polyline', points: '18 15 12 9 6 15' }],
  clock: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    { t: 'polyline', points: '12 7 12 12 15.5 14' },
  ],
  disc: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    { t: 'circle', cx: 12, cy: 12, r: 2.5 },
  ],
  edit: [
    {
      t: 'path',
      d: 'M17 3.5a2.828 2.828 0 1 1 4 4L7.5 21 2 22.5 3.5 17 17 3.5z',
    },
  ],
  check: [{ t: 'polyline', points: '20 6.5 9 17.5 4 12.5' }],
  info: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    { t: 'line', x1: 12, y1: 16.5, x2: 12, y2: 12 },
    { t: 'line', x1: 12, y1: 8, x2: 12.2, y2: 8 },
  ],
  refresh: [
    { t: 'polyline', points: '20.5 4 20.5 10 14.5 10' },
    {
      t: 'path',
      d: 'M20.49 15.5a9 9 0 1 1-2.12-9.86L20.5 10',
    },
  ],
  scan: [
    { t: 'line', x1: 3.5, y1: 7, x2: 3.5, y2: 5.5 },
    { t: 'path', d: 'M3.5 5.5A2 2 0 0 1 5.5 3.5h2' },
    { t: 'line', x1: 16.5, y1: 3.5, x2: 18.5, y2: 3.5 },
    { t: 'path', d: 'M18.5 3.5a2 2 0 0 1 2 2v2' },
    { t: 'line', x1: 20.5, y1: 17, x2: 20.5, y2: 18.5 },
    { t: 'path', d: 'M20.5 18.5a2 2 0 0 1-2 2h-2' },
    { t: 'line', x1: 7.5, y1: 20.5, x2: 5.5, y2: 20.5 },
    { t: 'path', d: 'M5.5 20.5a2 2 0 0 1-2-2v-2' },
  ],
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  style?: object;
}

export function Icon({
  name,
  size = 22,
  color = '#F4F4F5',
  strokeWidth = 1.8,
  style,
}: IconProps) {
  const nodes = ICONS[name] ?? [];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {nodes.map((node, i) => {
        switch (node.t) {
          case 'path':
            return node.fill ? (
              <Path key={i} d={node.d} fill={color} stroke="none" />
            ) : (
              <Path key={i} d={node.d} />
            );
          case 'polygon':
            return node.fill ? (
              <Polygon key={i} points={node.points} fill={color} stroke="none" />
            ) : (
              <Polygon key={i} points={node.points} />
            );
          case 'polyline':
            return <Polyline key={i} points={node.points} />;
          case 'line':
            return (
              <Line
                key={i}
                x1={node.x1}
                y1={node.y1}
                x2={node.x2}
                y2={node.y2}
              />
            );
          case 'rect':
            return node.fill ? (
              <Rect
                key={i}
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx={node.rx ?? 0}
                fill={color}
                stroke="none"
              />
            ) : (
              <Rect
                key={i}
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx={node.rx ?? 0}
              />
            );
          case 'circle':
            return node.fill ? (
              <Circle key={i} cx={node.cx} cy={node.cy} r={node.r} fill={color} stroke="none" />
            ) : (
              <Circle key={i} cx={node.cx} cy={node.cy} r={node.r} />
            );
          default:
            return null;
        }
      })}
    </Svg>
  );
}