import React from 'react';
import { ResponsiveLine, Serie, Line } from '@nivo/line';
import { Score } from '../models/score';

export const MyResponsiveLine: React.FC<{ data: Serie[]; scoreData: Score[] }> = ({ data, scoreData }) => (
  <ResponsiveLine
    data={data}
    margin={{ top: 100, right: 150, bottom: 100, left: 60 }}
    xScale={{ type: 'point' }}
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
    colors={{ scheme: 'nivo' }}
    pointSize={10}
    pointColor={{ theme: 'background' }}
    pointBorderWidth={2}
    pointBorderColor={{ from: 'serieColor' }}
    pointLabel='y'
    pointLabelYOffset={-12}
    useMesh={true}
    theme={{ labels: { text: { color: '#aaaaaa' } }, legends: { text: { color: '#aaaaaa' } } }}
    tooltip={({ point }) => {
      const current = scoreData.find(d => d.score1 === point.data.y || d.score2 === point.data.y);
      if (!current) {
        return <div />;
      }
      return (
        <div>
          <div>{`${current.team1}: ${current.team1Score}`}</div>
          <div>{`${current.team2}: ${current.team2Score}`}</div>
          <div style={{ width: 200 }}>{current.detail}</div>
        </div>
      );
    }}
    legends={[
      {
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
