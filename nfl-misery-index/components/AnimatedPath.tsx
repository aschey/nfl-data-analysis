import { ComputedDatum } from "@nivo/line";
import { animated } from "react-spring";
import React from "react";
import { useThemeUI } from "theme-ui";
import { DatumValue } from "@nivo/core";
import { useAnimatedPath } from "../hooks/useAnimatedPath";
import { HighlightLineProps } from "./HighlightLine";

interface AnimatedPathProps {
  data: ComputedDatum[];
  layerProps: HighlightLineProps;
  positiveDistances: number[];
  negativeDistances: number[];
  onAnimationEnd: () => void;
}

const getDashArray = (distances: number[], oppositeDistances: number[]) => {
  let oppDistances = oppositeDistances;
  if (oppDistances.length > 0 && oppDistances[0] === 0) {
    oppDistances = oppositeDistances.slice(1);
  }
  return distances
    .map((p, i) => [p, oppDistances[i]])
    .flat()
    .join(" ");
};

export const AnimatedPath: React.FC<AnimatedPathProps> = ({
  data,
  layerProps,
  positiveDistances,
  negativeDistances,
  onAnimationEnd,
}) => {
  const { lineGenerator } = layerProps;
  const { theme } = useThemeUI();
  const xScale = layerProps.xScale as unknown as (x: DatumValue) => DatumValue;
  const yScale = layerProps.yScale as unknown as (y: DatumValue) => DatumValue;

  const line = lineGenerator(
    data.map((d) => ({
      x: xScale(d?.data.x ?? 0),
      y: yScale(d?.data.y ?? 0),
    })),
  );

  const path = useAnimatedPath(line, onAnimationEnd);
  if (!theme.colors) {
    return null;
  }

  const dashPositive = getDashArray(positiveDistances, negativeDistances);

  const dashNegative = getDashArray(negativeDistances, positiveDistances);

  return (
    <>
      <animated.path
        d={path}
        strokeDasharray={dashPositive}
        fill="none"
        stroke={theme.colors.highlightPositive as string}
        style={{
          strokeWidth: 2,
        }}
      />
      <animated.path
        d={path}
        strokeDasharray={dashNegative}
        fill="none"
        stroke={theme.colors.highlightNegative as string}
        style={{
          strokeWidth: 2,
        }}
      />
    </>
  );
};
