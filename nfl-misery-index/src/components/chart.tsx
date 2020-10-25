import React from 'react';
import { max } from 'lodash';
import { ResponsiveLine, Serie, Line } from '@nivo/line';
import { Score } from '../models/score';

const renderTick = (data: any) => {
  return (
    <text
      dominantBaseline={data.textBaseline}
      textAnchor={data.textAnchor}
      transform={`translate(${data.x},${data.textY}) rotate(0)`}
      style={{ fontFamily: 'sans-serif', fontSize: 11, fill: 'rgb(170, 170, 170)' }}
    >
      {data.value === 5 ? 'OT' : data.value}
    </text>
  );
};

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

export const ScoreLine: React.FC<{ data: ColoredSerie[]; scoreData: Score[] }> = ({ data, scoreData }) => (
  <ResponsiveLine
    data={data}
    curve='catmullRom'
    margin={{ top: 100, right: 150, bottom: 100, left: 60 }}
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
    colors={data.map(d => d.color)}
    pointSize={10}
    pointColor={{ theme: 'background' }}
    pointBorderWidth={2}
    pointBorderColor={{ from: 'serieColor' }}
    pointLabel='y'
    pointLabelYOffset={-12}
    useMesh={true}
    theme={{
      background: '#0e1317',
      textColor: '#aaaaaa',
      crosshair: { line: { stroke: '#aaaaaa' } },
      legends: { text: { fill: '#aaaaaa' } },
      grid: { line: { stroke: '#424141' } },
    }}
    tooltip={({ point }) => {
      let showTeam1 = point.serieId === scoreData[0].team1;
      let index = parseInt(point.id.split('.')[1]);
      let current = scoreData[index];
      return (
        <div style={{ background: 'black', borderRadius: 5, padding: 5, fontSize: 12 }}>
          <div>{`${current.team1}: ${current.team1Score}`}</div>
          <div>{`${current.team2}: ${current.team2Score}`}</div>
          <div>{`${showTeam1 ? current.team1 : current.team2} Misery Index: ${
            showTeam1 ? current.score1 : current.score2
          }`}</div>
          <div style={{ width: 200 }}>{current.detail}</div>
        </div>
      );
    }}
    legends={[
      {
        data:
          data.length > 0
            ? [
                { color: data[0].color, id: data[0].id, label: scoreData[0].team1 },
                { color: data[1].color, id: data[1].id, label: scoreData[0].team2 },
              ]
            : [],
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
