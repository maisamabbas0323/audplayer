import { useWindowDimensions } from 'react-native';

const DOCK_HEIGHT = 72;

export function useDockPadding() {
  const { height } = useWindowDimensions();
  const extra = height < 640 ? 4 : 0;
  return DOCK_HEIGHT + extra;
}