import { interpolateString } from 'd3-interpolate';
import { useMemo } from 'react';
import { useSpring, to, Interpolation } from 'react-spring';
import { usePrevious } from './usePrevious';

export const useAnimatedPath = (path: string, onRest: () => void): Interpolation<string, string> => {
  const previousPath = usePrevious(path);
  const interpolator = useMemo(() => interpolateString(previousPath ?? '', path), [previousPath, path]);

  const { value } = useSpring({
    from: { value: 0 },
    to: { value: 1 },
    reset: true,
    onRest,
  });

  return to(value, interpolator);
};
