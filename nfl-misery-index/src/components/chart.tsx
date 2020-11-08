import React, { memo, useMemo } from 'react';
import { max, flatMap } from 'lodash';
import { Defs, linearGradientDef, useAnimatedPath, useMotionConfig } from '@nivo/core';
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
import { useSpring, animated } from 'react-spring';
import { Score } from '../models/score';
import { ThemeProvider, useThemeUI } from 'theme-ui';

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
        strokeDasharray={dash1}
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
        strokeDasharray={dash2}
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
  debugger;
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
  // return flatMap(
  //   series.map(({ id, data, color }) => (
  //     <>
  //       {
  //         flatMap(
  //           partitionData(data).map((d, i) => {
  //             return (
  //               <AnimatedPath d={d} i={i} key={id + i.toString()} id={id + i.toString()} layerProps={layerProps} />
  //             );
  //           })
  //         )[0]
  //       }
  //     </>
  //   ))
  // )[0];
};

export const ScoreLine: React.FC<{
  data: ColoredSerie[];
  scoreData: Score[];
  overrideIndex: number | undefined;
  setIndex(index: number | undefined): void;
}> = ({ data, scoreData, overrideIndex, setIndex }) => {
  const { theme } = useThemeUI();

  const CustomSymbol = ({ size, color, borderWidth, borderColor, datum }: PointSymbolProps) => (
    <g>
      <circle
        fill={theme.colors?.background}
        r={size / 2}
        strokeWidth={borderWidth}
        stroke={datum.y > 0 || (datum.y === 0 && data[0].data.find(d => d.x > datum.x)?.y > 0) ? '#57f542' : '#eb4034'}
      />
    </g>
  );

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

  return (
    <ResponsiveLine
      data={data}
      key={'line'}
      //curve='catmullRom'
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
      overrideIndex={overrideIndex}
      pointSymbol={CustomSymbol}
      useMesh={true}
      layers={['grid', 'markers', 'areas', 'crosshair', 'slices', 'points', 'mesh', 'axes', 'legends', DashedLine]}
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
            <div style={{ width: 200 }}>{current.detail}</div>
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
