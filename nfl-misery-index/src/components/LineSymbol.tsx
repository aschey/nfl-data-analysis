import { PointSymbolProps, Serie } from '@nivo/line';
import { normal } from 'color-blend';
import React from 'react';
import { config, Spring } from 'react-spring/renderprops';
import { useThemeUI } from 'theme-ui';
import { getIsPositive, parseRgb } from '../util/util';

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
  if (!theme.colors) {
    return <></>;
  }
  const curData = data[0].data;
  const index = curData.findIndex(d => parseFloat((d.x as string) ?? '0') === (datum.x ?? 0));
  const yVal = parseFloat(curData[index].y as string);
  const isSelected = index === overrideIndex;
  const isPositive = getIsPositive(
    yVal,
    index < curData.length - 1 ? parseFloat(curData[index + 1].y as string) : yVal
  );

  const positiveColor = theme.colors['highlightPositive'] as string;
  const negativeColor = theme.colors['highlightNegative'] as string;
  const positive = parseRgb(positiveColor);
  const negative = parseRgb(negativeColor);
  const background = parseRgb(theme.colors?.background);
  const base = { r: 200, g: 200, b: 200, a: 1 };

  const blendedG = normal(background, { ...positive, a: 0.15 });
  const blendedR = normal(background, { ...negative, a: 0.15 });
  const textG = normal(base, { ...positive, a: 0.4 });
  const textR = normal(base, { ...negative, a: 0.4 });
  const pColor = isPositive ? blendedG : blendedR;
  const oColor = isPositive ? positive : negative;
  const fg = isPositive ? textG : textR;
  return (
    <Spring
      from={{ size: size * 0.5, dash1: 0, dash2: 50, ...oColor, a: 1.0, opacity: 0.0 }}
      to={{ size: size * 2, dash1: 12, dash2: 3, ...pColor, opacity: 1.0 }}
      config={{ ...config.gentle, mass: 0.8 }}
    >
      {props => (
        <g>
          <circle
            fill={isSelected ? `rgba(${props.r},${props.g},${props.b},${props.a})` : theme.colors?.background}
            r={isSelected ? props.size : size / 2}
            strokeWidth={borderWidth}
            strokeDasharray={isSelected ? `${props.dash1} ${props.dash2}` : undefined}
            stroke={isPositive ? positiveColor : negativeColor}
          ></circle>
          {isSelected && (
            <text
              textAnchor='middle'
              stroke={`rgba(${fg.r},${fg.g},${fg.b},${fg.a})`}
              strokeWidth={1}
              fontSize={8}
              opacity={props.opacity}
              style={{ transform: 'translate(0, 3px)' }}
            >
              {datum.y}
            </text>
          )}
        </g>
      )}
    </Spring>
  );
};
