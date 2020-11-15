import { PointSymbolProps, Serie } from '@nivo/line';
import { normal } from 'color-blend';
import React from 'react';
import { config, Spring } from 'react-spring/renderprops';
import { useThemeUI } from 'theme-ui';

interface CustomSymbolProps extends PointSymbolProps {
  data: Serie[];
  overrideIndex: number | undefined;
}

const green = { r: 87, g: 245, b: 66, a: 0.15 };
const red = { r: 235, g: 64, b: 52, a: 0.15 };
export const LineSymbol: React.FC<CustomSymbolProps> = ({
  size,
  borderWidth,
  datum,
  data,
  overrideIndex,
}: CustomSymbolProps) => {
  const { theme } = useThemeUI();
  const isSelected = data[0].data.findIndex(d => (d.x ?? 0) > (datum.x ?? 0)) - 1 === overrideIndex;
  const isPositive =
    (datum.y ?? 0) > 0 || ((datum.y === 0 && data[0].data.find(d => (d.x ?? 0) > (datum.x ?? 0))?.y) ?? 0 > 0);

  const blendedG = normal({ r: 30, g: 35, b: 46, a: 1 }, green);
  const blendedR = normal({ r: 30, g: 35, b: 46, a: 1 }, red);
  const textG = normal({ r: 200, g: 200, b: 200, a: 1 }, { ...green, a: 0.4 });
  const textR = normal({ r: 200, g: 200, b: 200, a: 1 }, { ...red, a: 0.4 });
  const pColor = isPositive ? blendedG : blendedR;
  const oColor = isPositive ? green : red;
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
            stroke={isPositive ? '#57f542' : '#eb4034'}
          ></circle>
          {isSelected && (
            <text
              text-anchor='middle'
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
