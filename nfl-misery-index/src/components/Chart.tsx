/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { max } from 'lodash';
import { ResponsiveLine, Serie, CustomLayerProps } from '@nivo/line';
import { Score } from '../models/score';
import { Styled, useThemeUI } from 'theme-ui';
import { HighlightLine } from './HighlightLine';
import { LineSymbol } from './LineSymbol';
import { getIsPositive, setOpacity } from '../util/util';

interface ScoreLineProps {
  data: Serie[];
  scoreData: Score[];
  isTeam1: boolean;
  overrideIndex: number | undefined;
  setIndex(index: number | undefined): void;
  onAnimationEnd: () => void;
}

const getMax = (data: Serie[]) => {
  if (data.length === 0) {
    return 4.0;
  }
  let m = max(data[0].data.map(d => d.x)) as number;
  let val = m > 4.0 ? m : 4.0;
  return val;
};

const isMobile = () => {
  return (
    navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|CRiOS|OPiOS|Mobile|FxiOS/i) !=
    null
  );
};

export const ScoreLine: React.FC<ScoreLineProps> = ({
  data,
  scoreData,
  overrideIndex,
  setIndex,
  isTeam1,
  onAnimationEnd,
}) => {
  const { theme } = useThemeUI();

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

  const LineWrapper: React.FC<CustomLayerProps> = props => {
    return <HighlightLine mode={catmull ? 'catmullRom' : 'linear'} onAnimationEnd={onAnimationEnd} {...props} />;
  };
  return (
    <ResponsiveLine
      data={data}
      key={'line'}
      curve={catmull ? 'catmullRom' : 'linear'}
      margin={{ right: 60, top: 30, bottom: 50, left: 60 }}
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
      pointSymbol={props => <LineSymbol {...props} data={data} overrideIndex={overrideIndex} />}
      useMesh={true}
      layers={['grid', 'markers', 'crosshair', 'slices', 'axes', 'legends', LineWrapper, 'points', 'mesh']}
      theme={{
        background: theme.colors?.background,
        textColor: theme.colors?.text,
        crosshair: { line: { stroke: theme.colors?.text } },
        legends: { text: { fill: theme.colors?.text } },
        grid: { line: { stroke: setOpacity(theme.colors?.text ?? '', 0.2) } },
        markers: { lineColor: setOpacity(theme.colors?.text ?? '', 0.7) },
      }}
      onMouseMove={point => {
        setIndex(point.index);
      }}
      onMouseLeave={() => setIndex(undefined)}
      tooltip={({ point }) => {
        let index = parseInt(point.id.split('.')[1]);
        let current = scoreData[index];
        const score = isTeam1 ? current.score1 : current.score2;
        let nextScore = score;
        if (index < scoreData.length - 1) {
          nextScore = isTeam1 ? scoreData[index + 1].score1 : scoreData[index + 1].score2;
        }
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
            <div>
              Misery Index:
              <span sx={{ color: getIsPositive(score, nextScore) ? 'highlightPositive' : 'highlightNegative' }}>
                {` ${score}`}
              </span>
            </div>
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
