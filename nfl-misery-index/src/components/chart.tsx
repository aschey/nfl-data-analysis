import React from 'react';
import { ResponsiveLine, Serie, Line } from '@nivo/line';

export const MyResponsiveLine: React.FC<{ data: Serie[] }> = ({ data }) => (
  <ResponsiveLine
    data={data}
    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
    xScale={{ type: 'point' }}
    yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
    axisTop={null}
    axisRight={null}
    axisBottom={{
      orient: 'bottom',
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: 'transportation',
      legendOffset: 36,
      legendPosition: 'middle',
    }}
    axisLeft={{
      orient: 'left',
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: 'count',
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

const data: Serie[] = [
  {
    id: 'japan',
    color: 'hsl(121, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 230,
      },
      {
        x: 'helicopter',
        y: 219,
      },
      {
        x: 'boat',
        y: 203,
      },
      {
        x: 'train',
        y: 98,
      },
      {
        x: 'subway',
        y: 67,
      },
      {
        x: 'bus',
        y: 18,
      },
      {
        x: 'car',
        y: 294,
      },
      {
        x: 'moto',
        y: 265,
      },
      {
        x: 'bicycle',
        y: 216,
      },
      {
        x: 'horse',
        y: 271,
      },
      {
        x: 'skateboard',
        y: 69,
      },
      {
        x: 'others',
        y: 54,
      },
    ],
  },
];

export const Chart: React.FC<{}> = () => <MyResponsiveLine data={data} />;
