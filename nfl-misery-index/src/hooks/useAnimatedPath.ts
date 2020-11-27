import { interpolateString } from 'd3-interpolate';
import { useMemo } from 'react';
import { useSpring } from 'react-spring';
import { usePrevious } from './usePrevious';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAnimatedPath = (path: string, onRest: () => void): any => {
  const previousPath = usePrevious(path);
  const interpolator = useMemo(() => interpolateString(previousPath ?? '', path), [previousPath, path]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { value }: any = useSpring({
    from: { value: 0 },
    to: { value: 1 },
    reset: true,
    onRest,
  });

  return value.interpolate(interpolator);
};
