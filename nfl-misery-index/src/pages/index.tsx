/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { ScoreLine } from '../components/Chart';
import { Score } from '../models/score';
import { Datum, Serie } from '@nivo/line';
import { flow, groupBy, mapValues, flatMap } from 'lodash/fp';
import { Box, Flex, Styled, Card } from 'theme-ui';
import { Controls } from '../components/Controls';
import { ScoreTable } from '../components/ScoreTable';
import { ClientOnly } from '../components/ClientOnly';

export interface Value {
  label: string;
  value: string;
}
export interface IntValue {
  label: number;
  value: number;
}

const Index: React.FC<Record<string, unknown>> = () => {
  const [data, setData] = useState<Score[]>([]);
  const [chartData, setChartData] = useState<Serie[]>([]);
  const [gameData, setGameData] = useState<Score[]>([]);
  const [year, setYear] = useState<IntValue>({ value: 2020, label: 2020 });
  const [weeks, setWeeks] = useState<Value[]>([]);
  const [week, setWeek] = useState<Value>({ label: 'Week 1', value: 'Week 1' });
  const [currentGames, setCurrentGames] = useState<Value[]>([]);
  const [currentGame, setCurrentGame] = useState<Value>({
    label: '',
    value: '',
  });
  const [isTeam1, setIsTeam1] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);
  const [overrideIndex, setOverrideIndex] = useState<number | undefined>(undefined);
  const [enableHover, setEnableHover] = useState(true);

  const selectHeight = 38;
  const controlHeight = selectHeight + 10;
  const controlHeightTwoRows = selectHeight * 2 + 10;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Papa.parse<any>('https://nfl-index-data.s3.us-east-2.amazonaws.com/scores_with_index.csv', {
      download: true,
      worker: true,
      header: true,
      complete: results => {
        const csvData = results.data.map<Score>(d => ({
          detail: d.Detail,
          quarter: parseFloat(d.Quarter?.startsWith('OT') ? 5 : d.Quarter),
          date: new Date(d.date),
          score1: Math.round(parseFloat(d.score1) * 100) / 100,
          score2: Math.round(parseFloat(d.score2) * 100) / 100,
          team1: d.team1_mascot,
          team2: d.team2_mascot,
          team1Score: parseFloat(d.team1_score),
          team2Score: parseFloat(d.team2_score),
          week: d.week,
          year: parseInt(d.year),
          matchup: `${d.team1_mascot} vs ${d.team2_mascot}`,
          scoringTeam: d.Tm,
        }));

        setData(csvData);
      },
    });
  }, [setData, setChartData]);

  useEffect(() => {
    if (data.length === 0 || !year || !week) {
      return;
    }

    const game = data.filter(
      d =>
        d.year === year.value &&
        d.week === week.value &&
        (d.team1 === currentGame.value || d.team2 === currentGame.value)
    );

    if (game.length === 0) {
      return;
    }
    game.unshift({
      quarter: 1,
      team1: game[0].team1,
      team2: game[0].team2,
      team1Score: 0,
      team2Score: 0,
      detail: '',
      score1: 0,
      score2: 0,
      date: game[0].date,
      week: game[0].week,
      year: game[0].year,
      matchup: game[0].matchup,
      scoringTeam: '',
    });
    const isTeam1Val = currentGame.value === game[0].team1;
    setIsTeam1(isTeam1Val);
    setGameData(game);
    const lineData = flow(
      groupBy<Score>(g => g.quarter),
      mapValues(g =>
        g.map<Datum>((g, i) => ({
          x: `${g.quarter}.${i}`,
          y: isTeam1Val ? g.score1 : g.score2,
        }))
      ),
      flatMap(g => g)
    )(game) as Datum[];

    setChartData([
      {
        key: 'data',
        id: 'data',
        color: 'gray',
        data: lineData,
      },
    ]);
    setEnableHover(false);
  }, [currentGame, data, week, year]);

  const onAnimationEnd = () => setEnableHover(true);

  const cardItemPadding = ['10px 10px 0 10px', '10px 10px 0 10px', '50px 10px 0 10px'];

  return (
    <Styled.div
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: [
          `calc(100% - ${controlHeightTwoRows}px)`,
          `calc(100% - ${controlHeightTwoRows}px)`,
          `calc(100% - ${controlHeight}px)`,
        ],
        padding: '10px 0',
      }}
    >
      <Controls
        year={year}
        setYear={setYear}
        currentGame={currentGame}
        setCurrentGame={setCurrentGame}
        week={week}
        setWeek={setWeek}
        currentGames={currentGames}
        setCurrentGames={setCurrentGames}
        weeks={weeks}
        setWeeks={setWeeks}
        data={data}
      />
      <Flex
        sx={{
          width: '100%',
          height: '100%',
          flexDirection: ['column', 'column', 'row'],
        }}
      >
        <Flex
          sx={{
            fontSize: 14,
            padding: cardItemPadding,
            width: ['100%', '100%', 1000],
            height: ['40%', '40%', '100%'],
            alignSelf: ['center', 'center', 'flex-start'],
          }}
        >
          <ScoreTable
            gameData={gameData}
            setOverrideIndex={setOverrideIndex}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            isTeam1={isTeam1}
            enableHover={enableHover}
          />
        </Flex>
        <Box
          sx={{
            width: '100%',
            height: ['60%', '60%', '100%'],
            padding: cardItemPadding,
          }}
        >
          <Card
            sx={{
              width: '100%',
              height: '100%',
            }}
          >
            <ScoreLine
              data={chartData}
              scoreData={gameData}
              setIndex={setHoveredIndex}
              overrideIndex={overrideIndex}
              isTeam1={isTeam1}
              onAnimationEnd={onAnimationEnd}
            />
          </Card>
        </Box>
      </Flex>
    </Styled.div>
  );
};

export default Index;
