import React from 'react';
import { ResponsiveLine, Serie, Line } from '@nivo/line';

const MyResponsiveLine: React.FC<{ data: Serie[] }> = ({ data }) => (
  <ResponsiveLine
    data={data}
    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
    xScale={{ type: 'point' }}
    yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
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
  {
    id: 'france',
    color: 'hsl(331, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 22,
      },
      {
        x: 'helicopter',
        y: 243,
      },
      {
        x: 'boat',
        y: 297,
      },
      {
        x: 'train',
        y: 112,
      },
      {
        x: 'subway',
        y: 192,
      },
      {
        x: 'bus',
        y: 100,
      },
      {
        x: 'car',
        y: 81,
      },
      {
        x: 'moto',
        y: 120,
      },
      {
        x: 'bicycle',
        y: 267,
      },
      {
        x: 'horse',
        y: 102,
      },
      {
        x: 'skateboard',
        y: 63,
      },
      {
        x: 'others',
        y: 241,
      },
    ],
  },
  {
    id: 'us',
    color: 'hsl(201, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 284,
      },
      {
        x: 'helicopter',
        y: 17,
      },
      {
        x: 'boat',
        y: 259,
      },
      {
        x: 'train',
        y: 247,
      },
      {
        x: 'subway',
        y: 153,
      },
      {
        x: 'bus',
        y: 24,
      },
      {
        x: 'car',
        y: 10,
      },
      {
        x: 'moto',
        y: 81,
      },
      {
        x: 'bicycle',
        y: 283,
      },
      {
        x: 'horse',
        y: 98,
      },
      {
        x: 'skateboard',
        y: 256,
      },
      {
        x: 'others',
        y: 96,
      },
    ],
  },
  {
    id: 'germany',
    color: 'hsl(167, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 157,
      },
      {
        x: 'helicopter',
        y: 117,
      },
      {
        x: 'boat',
        y: 142,
      },
      {
        x: 'train',
        y: 259,
      },
      {
        x: 'subway',
        y: 51,
      },
      {
        x: 'bus',
        y: 122,
      },
      {
        x: 'car',
        y: 300,
      },
      {
        x: 'moto',
        y: 214,
      },
      {
        x: 'bicycle',
        y: 197,
      },
      {
        x: 'horse',
        y: 293,
      },
      {
        x: 'skateboard',
        y: 77,
      },
      {
        x: 'others',
        y: 169,
      },
    ],
  },
  {
    id: 'norway',
    color: 'hsl(140, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 283,
      },
      {
        x: 'helicopter',
        y: 293,
      },
      {
        x: 'boat',
        y: 25,
      },
      {
        x: 'train',
        y: 224,
      },
      {
        x: 'subway',
        y: 79,
      },
      {
        x: 'bus',
        y: 241,
      },
      {
        x: 'car',
        y: 110,
      },
      {
        x: 'moto',
        y: 80,
      },
      {
        x: 'bicycle',
        y: 145,
      },
      {
        x: 'horse',
        y: 219,
      },
      {
        x: 'skateboard',
        y: 28,
      },
      {
        x: 'others',
        y: 96,
      },
    ],
  },
];

export const Chart: React.FC<{}> = () => <MyResponsiveLine data={data} />;
