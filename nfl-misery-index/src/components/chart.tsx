import React, { memo, useMemo } from 'react';
import { max, flatMap } from 'lodash';
import { Defs, linearGradientDef, useAnimatedPath } from '@nivo/core';
import {
  ResponsiveLine,
  Serie,
  Line,
  CustomLayer,
  CustomLayerProps,
  ComputedSerie,
  ComputedDatum,
  Datum,
  PointSymbolProps,
} from '@nivo/line';
import { useSpring, animated, config } from 'react-spring';
import { Score } from '../models/score';
import { ThemeProvider, useThemeUI } from 'theme-ui';
import { Spring } from 'react-spring/renderprops';
import { colorDodge, hue, normal, overlay } from 'color-blend';

const getMax = (data: Serie[]) => {
  if (data.length === 0) {
    return 4.0;
  }
  let m = max(data[0].data.map(d => d.x)) as number;
  let val = m > 4.0 ? m : 4.0;
  return val;
};

export interface ColoredSerie extends Serie {
  color: string;
}

const AnimatedPath = ({
  d,
  layerProps,
  positiveDistances,
  negativeDistances,
}: {
  d: ComputedDatum[];
  layerProps: CustomLayerProps;
  positiveDistances: number[];
  negativeDistances: number[];
}) => {
  const { series, lineGenerator, xScale, yScale } = layerProps;
  const data = lineGenerator(
    d.map(d1 => ({
      x: xScale(d1.data.x),
      y: yScale(d1.data.y),
    }))
  );
  const path = useAnimatedPath(data);
  const dash1 = positiveDistances
    .map((p, i) => [
      p,
      negativeDistances.length > 0 && negativeDistances[0] === 0 ? negativeDistances.slice(1)[i] : negativeDistances[i],
    ])
    .flat()
    .join(' ');
  const dashArray1 = useAnimatedPath(dash1);
  const dash2 = negativeDistances
    .map((p, i) => [
      p,
      positiveDistances.length > 0 && positiveDistances[0] === 0 ? positiveDistances.slice(1)[i] : positiveDistances[i],
    ])
    .flat()
    .join(' ');
  const dashArray2 = useAnimatedPath(dash2);
  //debugger;
  //console.log(path);
  return (
    <>
      <animated.path
        d={path}
        strokeDasharray={dashArray1}
        fill='none'
        stroke='#57f542'
        style={{
          strokeWidth: 2,
        }}
      />
      <animated.path
        d={path}
        //pathLength={negativeDistances.concat(positiveDistances).reduce((prev, current) => prev + current)}
        //pathLength={2603.011474609375}
        strokeDasharray={dashArray2}
        //strokeDashoffset='5'
        fill='none'
        stroke='#eb4034'
        style={{
          strokeWidth: 2,
        }}
      />
    </>
  );
};

const DashedLine = ({
  series,
  lineGenerator,
  xScale,
  yScale,
  innerWidth,
  innerHeight,
  points,
  data: data2,
}: CustomLayerProps) => {
  //const { series, lineGenerator, xScale, yScale } = layerProps;
  let positiveDistances: number[] = [0];
  let negativeDistances: number[] = [0];
  for (let serie of series) {
    let yZero = yScale(0);
    for (let i = 0; i < serie.data.length - 1; i++) {
      let d1 = serie.data[i].data;
      let d2 = serie.data[i + 1].data;
      let d1x = xScale((d1.x as number) ?? 0);
      let d1y = yScale((d1.y as number) ?? 0);
      let d2x = xScale((d2.x as number) ?? 0);
      let d2y = yScale((d2.y as number) ?? 0);
      let d3x = 0;
      let d3y = 0;
      let d4x = 0;
      let d4y = 0;
      if (i > 0) {
        let d3 = serie.data[i - 1].data;
        d3x = xScale((d3.x as number) ?? 0);
        d3y = yScale((d3.y as number) ?? 0);
      } else {
        d3x = 2 * d1x - d2x;
        d3y = 2 * d1y - d2y;
      }
      if (i < serie.data.length - 2) {
        let d4 = serie.data[i + 2].data;
        d4x = xScale((d4.x as number) ?? 0);
        d4y = yScale((d4.y as number) ?? 0);
      } else {
        d4x = 2 * d2x - d1x;
        d4y = 2 * d2y - d1y;
      }
      //if (d1y > yZero && d2y < yZero) {
      if (d1y < yZero && d2y > yZero) {
        // let m = (d2y - d1y) / (d2x - d1x);
        // let b = d1y - m * d1x;
        // let intercept = (yZero - b) / m;
        let distance = catmullRomDistance(
          { x: d3x, y: d3y },
          { x: d1x, y: d1y },
          { x: d2x, y: d2y },
          { x: d4x, y: d4y },
          yZero,
          true,
          false
        );
        positiveDistances[positiveDistances.length - 1] += distance;
        let distance2 = catmullRomDistance(
          { x: d3x, y: d3y },
          { x: d1x, y: d1y },
          { x: d2x, y: d2y },
          { x: d4x, y: d4y },
          yZero,
          false,
          true
        );
        negativeDistances.push(distance2);
        //newData.push(serie.data[i], { ...serie.data[i], data: { x: intercept, y: 0 } });
        //} else if (d1y < yZero && d2y > yZero) {
      } else if (d1y > yZero && d2y < yZero) {
        // let m = (d2y - d1y) / (d2x - d1x);
        // let b = d1y - m * d1x;
        // let intercept = (yZero - b) / m;
        // let distance = Math.sqrt(Math.pow(intercept - d1x, 2) + Math.pow(yZero - d1y, 2));
        let distance = catmullRomDistance(
          { x: d3x, y: d3y },
          { x: d1x, y: d1y },
          { x: d2x, y: d2y },
          { x: d4x, y: d4y },
          yZero,
          true,
          false
        );
        negativeDistances[negativeDistances.length - 1] += distance;
        //let distance2 = Math.sqrt(Math.pow(d2x - intercept, 2) + Math.pow(d2y - yZero, 2));
        let distance2 = catmullRomDistance(
          { x: d3x, y: d3y },
          { x: d1x, y: d1y },
          { x: d2x, y: d2y },
          { x: d4x, y: d4y },
          yZero,
          false,
          true
        );
        positiveDistances.push(distance2);
      } else if (d1y === yZero && d2y > yZero && i > 0 && d3y < yZero) {
        let distance = catmullRomDistance(
          { x: d3x, y: d3y },
          { x: d1x, y: d1y },
          { x: d2x, y: d2y },
          { x: d4x, y: d4y },
          yZero,
          false,
          false
        );
        negativeDistances.push(distance);
        //} else if (d1y === yZero && d2y > yZero && i > 0 && d3y < yZero) {
      } else if (d1y === yZero && d2y < yZero && i > 0 && d3y > yZero) {
        //let distance = Math.sqrt(Math.pow(d2x - d1x, 2) + Math.pow(d2y - d1y, 2));
        let distance = catmullRomDistance(
          { x: d3x, y: d3y },
          { x: d1x, y: d1y },
          { x: d2x, y: d2y },
          { x: d4x, y: d4y },
          yZero,
          false,
          false
        );
        positiveDistances.push(distance);
        //} else if (d2y < yZero || (d2y === yZero && d1y < yZero)) {
      } else if (d2y > yZero || (d2y === yZero && d1y > yZero)) {
        //debugger;
        //let distance = Math.sqrt(Math.pow(d2x - d1x, 2) + Math.pow(d2y - d1y, 2));
        let distance = catmullRomDistance(
          { x: d3x, y: d3y },
          { x: d1x, y: d1y },
          { x: d2x, y: d2y },
          { x: d4x, y: d4y },
          yZero,
          false,
          false
        );
        negativeDistances[negativeDistances.length - 1] += distance;
        //} else if (d2y > yZero || (d2y === yZero && d1y < yZero)) {
      } else if (d2y < yZero || (d2y === yZero && d1y < yZero)) {
        //let distance = Math.sqrt(Math.pow(d2x - d1x, 2) + Math.pow(d2y - d1y, 2));
        let distance = catmullRomDistance(
          { x: d3x, y: d3y },
          { x: d1x, y: d1y },
          { x: d2x, y: d2y },
          { x: d4x, y: d4y },
          yZero,
          false,
          false
        );
        positiveDistances[positiveDistances.length - 1] += distance;
      }
    }
    //newData.push(serie.data[serie.data.length - 1]);
    //serie.data = newData;
  }
  //debugger;
  return series.map(({ id, data, color }) => (
    <AnimatedPath
      d={data}
      //id={id}
      key={id}
      positiveDistances={positiveDistances}
      negativeDistances={negativeDistances}
      layerProps={{ series, lineGenerator, xScale, yScale, innerWidth, innerHeight, points, data: data2 }}
    />
  ));
};

const DashedLine2 = ({
  series,
  lineGenerator,
  xScale,
  yScale,
  innerWidth,
  innerHeight,
  points,
  data: data2,
}: CustomLayerProps) => {
  //const { series, lineGenerator, xScale, yScale } = layerProps;
  let positiveDistances: number[] = [0];
  let negativeDistances: number[] = [0];
  for (let serie of series) {
    let yZero = yScale(0);
    for (let i = 0; i < serie.data.length - 1; i++) {
      let d1 = serie.data[i].data;
      let d2 = serie.data[i + 1].data;
      let d1x = xScale((d1.x as number) ?? 0);
      let d1y = yScale((d1.y as number) ?? 0);
      let d2x = xScale((d2.x as number) ?? 0);
      let d2y = yScale((d2.y as number) ?? 0);
      let d3x = 0;
      let d3y = 0;
      if (i > 0) {
        let d3 = serie.data[i - 1].data;
        let d3x = xScale((d3.x as number) ?? 0);
        let d3y = yScale((d3.y as number) ?? 0);
      }
      if (d1y < yZero && d2y > yZero) {
        let m = (d2y - d1y) / (d2x - d1x);
        let b = d1y - m * d1x;
        let intercept = (yZero - b) / m;
        let distance = Math.sqrt(Math.pow(intercept - d1x, 2) + Math.pow(yZero - d1y, 2));
        positiveDistances[positiveDistances.length - 1] += distance;
        let distance2 = Math.sqrt(Math.pow(d2x - intercept, 2) + Math.pow(d2y - yZero, 2));
        negativeDistances.push(distance2);
        //newData.push(serie.data[i], { ...serie.data[i], data: { x: intercept, y: 0 } });
      } else if (d1y > yZero && d2y < yZero) {
        let m = (d2y - d1y) / (d2x - d1x);
        let b = d1y - m * d1x;
        let intercept = (yZero - b) / m;
        let distance = Math.sqrt(Math.pow(intercept - d1x, 2) + Math.pow(yZero - d1y, 2));
        negativeDistances[negativeDistances.length - 1] += distance;
        let distance2 = Math.sqrt(Math.pow(d2x - intercept, 2) + Math.pow(d2y - yZero, 2));
        positiveDistances.push(distance2);
      } else if (d1y === yZero && d2y > yZero && i > 0 && d3y < yZero) {
        let distance = Math.sqrt(Math.pow(d2x - d1x, 2) + Math.pow(d2y - d1y, 2));
        negativeDistances.push(distance);
      } else if (d1y === yZero && d2y < yZero && i > 0 && d3y > yZero) {
        let distance = Math.sqrt(Math.pow(d2x - d1x, 2) + Math.pow(d2y - d1y, 2));
        positiveDistances.push(distance);
      } else if (d2y > yZero || (d2y === yZero && d1y > yZero)) {
        //debugger;
        let distance = Math.sqrt(Math.pow(d2x - d1x, 2) + Math.pow(d2y - d1y, 2));
        negativeDistances[negativeDistances.length - 1] += distance;
      } else if (d2y < yZero || (d2y === yZero && d1y < yZero)) {
        let distance = Math.sqrt(Math.pow(d2x - d1x, 2) + Math.pow(d2y - d1y, 2));
        positiveDistances[positiveDistances.length - 1] += distance;
      }
    }
    //newData.push(serie.data[serie.data.length - 1]);
    //serie.data = newData;
  }
  //debugger;
  return series.map(({ id, data, color }) => (
    <AnimatedPath
      d={data}
      //id={id}
      key={id}
      positiveDistances={positiveDistances}
      negativeDistances={negativeDistances}
      layerProps={{ series, lineGenerator, xScale, yScale, innerWidth, innerHeight, points, data: data2 }}
    />
  ));
};

interface Point {
  x: number;
  y: number;
}

const pointDistance = (p1: Point, p2: Point) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const catmullRomDistance = (
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  yZero: number,
  toZero: boolean,
  fromZero: boolean
) => {
  // from https://qroph.github.io/2018/07/30/smooth-paths-using-catmull-rom-splines.html
  let t0 = 0.0;
  // default alpha in d3-shape
  let alpha = 0.5;
  let tension = 0;
  let t1 = t0 + Math.pow(pointDistance(p0, p1), alpha);
  let t2 = t1 + Math.pow(pointDistance(p1, p2), alpha);
  let t3 = t2 + Math.pow(pointDistance(p2, p3), alpha);
  const m1x =
    (1 - tension) * (t2 - t1) * ((p0.x - p1.x) / (t0 - t1) - (p0.x - p2.x) / (t0 - t2) + (p1.x - p2.x) / (t1 - t2));
  const m1y =
    (1 - tension) * (t2 - t1) * ((p0.y - p1.y) / (t0 - t1) - (p0.y - p2.y) / (t0 - t2) + (p1.y - p2.y) / (t1 - t2));
  const m2x =
    (1 - tension) * (t2 - t1) * ((p1.x - p2.x) / (t1 - t2) - (p1.x - p3.x) / (t1 - t3) + (p2.x - p3.x) / (t2 - t3));
  const m2y =
    (1 - tension) * (t2 - t1) * ((p1.y - p2.y) / (t1 - t2) - (p1.y - p3.y) / (t1 - t3) + (p2.y - p3.y) / (t2 - t3));

  const ax = 2 * p1.x - 2 * p2.x + m1x + m2x;
  const ay = 2 * p1.y - 2 * p2.y + m1y + m2y;
  const bx = -3 * p1.x + 3 * p2.x - 2 * m1x - m2x;
  const by = -3 * p1.y + 3 * p2.y - 2 * m1y - m2y;
  const cx = m1x;
  const cy = m1y;
  const dx = p1.x;
  const dy = p1.y;

  const amount = Math.round(pointDistance(p0, p1)) * 10;
  let epsilon = 0.5;
  let zeroFound = false;
  let total = 0;
  let prevX = 0;
  let prevY = 0;
  for (let j = 1; j <= amount; j++) {
    const t = j / amount;
    const px = ax * t * t * t + bx * t * t + cx * t + dx;
    const py = ay * t * t * t + by * t * t + cy * t + dy;
    if ((toZero || fromZero) && !zeroFound && Math.abs(yZero - py) <= epsilon) {
      zeroFound = true;
    }
    if (j === 1) {
      prevY = py;
      prevX = px;
      continue;
    }
    if ((!toZero && !fromZero) || (toZero && !zeroFound) || (fromZero && zeroFound)) {
      total += Math.sqrt(Math.pow(px - prevX, 2) + Math.pow(py - prevY, 2));
    }
    prevY = py;
    prevX = px;
  }

  return total;
};

interface CustomSymbolProps extends PointSymbolProps {
  data: Serie[];
  overrideIndex: number | undefined;
}

const CustomSymbol = ({ size, color, borderWidth, borderColor, datum, data, overrideIndex }: CustomSymbolProps) => {
  const { theme } = useThemeUI();
  // const props = useSpring({
  //   radius: data[0].data.findIndex(d => d.x > datum.x)) === overrideIndex - 1 ? size : size / 2,
  // });
  //debugger;
  //console.log(data[0].data.findIndex(d => d.x === datum.x));
  const isSelected = data[0].data.findIndex(d => d.x > datum.x) - 1 === overrideIndex;
  const isPositive = datum.y > 0 || (datum.y === 0 && data[0].data.find(d => d.x > datum.x)?.y > 0);
  const green = { r: 87, g: 245, b: 66, a: 0.15 };
  const red = { r: 235, g: 64, b: 52, a: 0.15 };
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

export const ScoreLine: React.FC<{
  data: ColoredSerie[];
  scoreData: Score[];
  overrideIndex: number | undefined;
  setIndex(index: number | undefined): void;
}> = ({ data, scoreData, overrideIndex, setIndex }) => {
  const { theme } = useThemeUI();

  // const partitionData = (data: ComputedDatum[]) => {
  //   let newData: ComputedDatum[][] = [[data[0]]];
  //   let greater = true;
  //   let current = 0;
  //   for (let i = 1; i < data.length; i++) {
  //     let d = data[i];
  //     if (d.data.y === 0) {
  //       newData[current].push(d);
  //       newData.push([d]);
  //       current++;
  //       greater = d.data.y >= 0;
  //     } else {
  //       newData[current].push(d);
  //     }
  //     // if ((d.data.y > 0 && greater) || (d.data.y < 0 && !greater)) {
  //     //   newData[current].push(d);
  //     // } else {
  //     //   newData.push([data[i - 1], d]);
  //     //   current++;
  //     //   greater = d.data.y >= 0;
  //     // }
  //   }
  //   return newData;
  // };

  const renderTick = (data: any) => {
    return (
      <text
        dominantBaseline={data.textBaseline}
        textAnchor={data.textAnchor}
        transform={`translate(${data.x},${data.textY}) rotate(0)`}
        style={{ fontFamily: 'sans-serif', fontSize: 11, fill: theme.colors?.text }}
      >
        {data.value === 5 ? 'OT' : data.value}
      </text>
    );
  };
  let catmull = true;
  return (
    <ResponsiveLine
      data={data}
      key={'line'}
      curve={catmull ? 'catmullRom' : 'linear'}
      margin={{ right: 150, top: 30, bottom: 50, left: 60 }}
      xScale={{ type: 'linear', min: 1, max: getMax(data) }}
      yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: 'bottom',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Quarter',
        legendOffset: 36,
        legendPosition: 'middle',
        tickValues: Math.round(getMax(data)),
        renderTick: renderTick,
      }}
      axisLeft={{
        orient: 'left',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Score',
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      markers={[{ axis: 'y', value: 0 }]}
      colors={data.map(d => d.color)}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabel='y'
      pointLabelYOffset={-12}
      enableSlices={false}
      //overrideIndex={overrideIndex}
      pointSymbol={props => <CustomSymbol {...props} data={data} overrideIndex={overrideIndex} />}
      useMesh={true}
      layers={[
        'grid',
        'markers',
        'areas',
        'crosshair',
        'slices',
        catmull ? DashedLine : DashedLine2,
        'points',
        'mesh',
        'axes',
        'legends',
      ]}
      defs={[
        linearGradientDef('gradientA', [
          { offset: 0, color: 'inherit' },
          { offset: 200, color: 'inherit', opacity: 0 },
        ]),
        linearGradientDef('gradientB', [
          { offset: 0, color: '#FF0000', opacity: 0 },
          { offset: 100, color: 'FF0000', opacity: 100 },
        ]),
      ]}
      theme={{
        background: theme.colors?.background,
        textColor: theme.colors?.text,
        crosshair: { line: { stroke: theme.colors?.text } },
        legends: { text: { fill: theme.colors?.text } },
        grid: { line: { stroke: `${theme.colors?.text}22` } },
        markers: { lineColor: `${theme.colors?.text}77` },
      }}
      onMouseMove={point => {
        setIndex(point.index);
      }}
      onMouseLeave={() => setIndex(undefined)}
      tooltip={({ point }) => {
        let showTeam1 = point.serieId === 'team1';
        let index = parseInt(point.id.split('.')[1]);
        let current = scoreData[index];
        return (
          <div
            style={{
              background: theme.colors?.secondary,
              borderRadius: 5,
              padding: 5,
              fontSize: 12,
              marginTop: 100,
            }}
          >
            <div>{`${current.team1}: ${current.team1Score}`}</div>
            <div>{`${current.team2}: ${current.team2Score}`}</div>
            <div>{`Misery Index: ${showTeam1 ? current.score1 : current.score2}`}</div>
            {/* <div style={{ width: 200 }}>{current.detail}</div> */}
          </div>
        );
      }}
      legends={[
        {
          data: [],
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};
