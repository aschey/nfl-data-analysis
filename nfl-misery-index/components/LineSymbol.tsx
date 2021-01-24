import { PointSymbolProps, Serie } from "@nivo/line";
import { normal } from "color-blend";
import React from "react";
import { animated, config, Spring } from "react-spring";
import { useThemeUI } from "theme-ui";
import { highlightNegative, highlightPositive } from "../theme/theme";
import { formatRgba, getIsPositive, parseRgba } from "../util/util";

interface CustomSymbolProps extends PointSymbolProps {
  data: Serie[];
  overrideIndex: number | undefined;
}

export const LineSymbol: React.FC<CustomSymbolProps> = ({
  size,
  borderWidth,
  datum,
  data,
  overrideIndex,
}: CustomSymbolProps) => {
  const { theme } = useThemeUI();

  const curData = data[0].data;
  const index = curData.findIndex(
    (d) => parseFloat((d.x as string) ?? "0") === (datum.x ?? 0),
  );
  const yVal = parseFloat(curData[index].y as string);
  const isSelected = index === overrideIndex;
  const isPositive = getIsPositive(
    yVal,
    index < curData.length - 1
      ? parseFloat(curData[index + 1].y as string)
      : yVal,
  );

  const positiveColor = theme.colors[highlightPositive] as string;
  const negativeColor = theme.colors[highlightNegative] as string;
  const positive = parseRgba(positiveColor);
  const negative = parseRgba(negativeColor);
  const background = parseRgba(theme.colors?.background ?? "");
  const base = { r: 200, g: 200, b: 200, a: 1 };

  const blendedG = normal(background, { ...positive, a: 0.15 });
  const blendedR = normal(background, { ...negative, a: 0.15 });
  const textPositive = normal(base, { ...positive, a: 0.4 });
  const textNegative = normal(base, { ...negative, a: 0.4 });

  const startColor = formatRgba(isPositive ? positive : negative);
  const endColor = formatRgba(isPositive ? blendedG : blendedR);

  const fg = isPositive ? textPositive : textNegative;

  return (
    <Spring
      from={{ size: size * 0.5, dash: "0 50", fill: startColor, opacity: 0.0 }}
      to={{ size: size * 2, dash: "12 3", fill: endColor, opacity: 1.0 }}
      config={{ ...config.gentle, mass: 0.8 }}
    >
      {(props) => (
        <animated.g>
          <animated.circle
            fill={isSelected ? props.fill : theme.colors?.background}
            r={isSelected ? props.size : size / 2}
            strokeWidth={borderWidth}
            strokeDasharray={isSelected ? props.dash : undefined}
            stroke={isPositive ? positiveColor : negativeColor}
          />
          {isSelected && (
            <animated.text
              textAnchor="middle"
              stroke={formatRgba(fg)}
              strokeWidth={1}
              fontSize={8}
              opacity={props.opacity}
              style={{ transform: "translate(0, 3px)" }}
            >
              {datum.y}
            </animated.text>
          )}
        </animated.g>
      )}
    </Spring>
  );
};
