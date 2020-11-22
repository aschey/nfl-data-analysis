import { interpolateString } from 'd3-interpolate';
import { useMemo } from 'react';
import { useSpring } from 'react-spring';
import { usePrevious } from './usePrevious';

export const useAnimatedPath = (path: string, onRest: () => void) => {
  const previousPath = usePrevious(path);
  const interpolator = useMemo(() => interpolateString(previousPath ?? '', path), [previousPath, path]);

  const { value }: any = useSpring({
    from: { value: 0 },
    to: { value: 1 },
    reset: true,
    onRest,
  });

  return value.interpolate(interpolator);
};
