import { useAnimatedPath } from '@nivo/core';
import { ComputedDatum, CustomLayerProps } from '@nivo/line';
import { animated } from 'react-spring';
import React from 'react';

interface AnimatedPathProps {
  data: ComputedDatum[];
  layerProps: CustomLayerProps;
  positiveDistances: number[];
  negativeDistances: number[];
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
}) => {
  const { lineGenerator, xScale, yScale } = layerProps;
  const line = lineGenerator(
    data.map(d => ({
      x: xScale(d?.data?.x ?? 0),
      y: yScale(d?.data?.y ?? 0),
    }))
  );
  const path = useAnimatedPath(line);
  const dashPositive = getDashArray(positiveDistances, negativeDistances);

  const dashNegative = getDashArray(negativeDistances, positiveDistances);

  return (
    <>
      <animated.path
        d={path}
        strokeDasharray={dashPositive}
        fill='none'
        stroke='#57f542'
        style={{
          strokeWidth: 2,
        }}
      />
      <animated.path
        d={path}
        strokeDasharray={dashNegative}
        fill='none'
        stroke='#eb4034'
        style={{
          strokeWidth: 2,
        }}
      />
    </>
  );
};
