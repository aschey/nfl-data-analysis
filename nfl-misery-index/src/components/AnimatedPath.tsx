import { ComputedDatum, CustomLayerProps } from '@nivo/line';
import { interpolateString } from 'd3-interpolate';
import { animated, useSpring } from 'react-spring';
import React, { useEffect, useMemo, useRef } from 'react';
import { useThemeUI } from 'theme-ui';

const usePrevious = <T,>(value: T) => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

const useAnimatedPath = (path: string, onRest: () => void) => {
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

interface AnimatedPathProps {
  data: ComputedDatum[];
  layerProps: CustomLayerProps;
  positiveDistances: number[];
  negativeDistances: number[];
  onAnimationEnd: () => void;
}

const getDashArray = (distances: number[], oppositeDistances: number[]) => {
  if (oppositeDistances.length > 0 && oppositeDistances[0] === 0) {
    oppositeDistances = oppositeDistances.slice(1);
  }
  return distances
    .map((p, i) => [p, oppositeDistances[i]])
    .flat()
    .join(' ');
};

export const AnimatedPath: React.FC<AnimatedPathProps> = ({
  data,
  layerProps,
  positiveDistances,
  negativeDistances,
  onAnimationEnd,
}) => {
  const { theme } = useThemeUI();
  if (!theme.colors) {
    return <></>;
  }
  const { lineGenerator, xScale, yScale } = layerProps;
  const line = lineGenerator(
    data.map(d => ({
      x: xScale(d?.data?.x ?? 0),
      y: yScale(d?.data?.y ?? 0),
    }))
  );
  const path = useAnimatedPath(line, onAnimationEnd);
  const dashPositive = getDashArray(positiveDistances, negativeDistances);

  const dashNegative = getDashArray(negativeDistances, positiveDistances);

  return (
    <>
      <animated.path
        d={path}
        strokeDasharray={dashPositive}
        fill='none'
        stroke={theme.colors['highlightPositive'] as string}
        style={{
          strokeWidth: 2,
        }}
      />
      <animated.path
        d={path}
        strokeDasharray={dashNegative}
        fill='none'
        stroke={theme.colors['highlightNegative'] as string}
        style={{
          strokeWidth: 2,
        }}
      />
    </>
  );
};
