/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useEffect, useState } from 'react';
import { ScoreLine } from '../components/Chart';
import { Score } from '../models/score';
import { Datum, Serie } from '@nivo/line';
import { flow, groupBy, mapValues, flatMap } from 'lodash/fp';
import { Box, Flex, Styled, Card } from 'theme-ui';
import { Controls } from '../components/Controls';
import { ScoreTable } from '../components/ScoreTable';
import { getJson } from '../util/fetchUtil';
import { Value } from '../models/value';
import { GameTeam } from '../models/gameTeam';

// export interface Value<T> {
//   label: string;
//   value: string | number;
// }
// export interface IntValue {
//   label: number;
//   value: number;
// }

const Index: React.FC<Record<string, unknown>> = () => {
  //const [data, setData] = useState<Score[]>([]);
  const [chartData, setChartData] = useState<Serie[]>([]);
  const [gameData, setGameData] = useState<Score[]>([]);
  //const [year, setYear] = useState<{value: number; label: number;}>({ value: 2020, label: 2020 });
  const [weeks, setWeeks] = useState<Value<number>[]>([]);
  const [week, setWeek] = useState<Value<number>>({ label: 'Week 1', value: 0 });
  const [currentGames, setCurrentGames] = useState<Value<GameTeam>[]>([]);
  const [currentGame, setCurrentGame] = useState<Value<GameTeam>>();
  const [isTeam1, setIsTeam1] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);
  const [overrideIndex, setOverrideIndex] = useState<number | undefined>(undefined);
  const [enableHover, setEnableHover] = useState(true);

  const selectHeight = 38;
  const controlHeight = selectHeight + 10;
  const controlHeightTwoRows = selectHeight * 2 + 10;

  // useEffect(() => {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   Papa.parse<any>('https://nfl-index-data.s3.us-east-2.amazonaws.com/scores_with_index.csv', {
  //     download: true,
  //     worker: true,
  //     header: true,
  //     complete: results => {
  //       debugger;
  //       const csvData = results.data.map<Score>(d => ({
  //         detail: d.detail,
  //         quarter: d.quarter,
  //         date: new Date(d.date),
  //         score1: Math.round(parseFloat(d.score1) * 100) / 100,
  //         score2: Math.round(parseFloat(d.score2) * 100) / 100,
  //         team1: d.team1_mascot,
  //         team2: d.team2_mascot,
  //         team1Score: parseFloat(d.team1_score),
  //         team2Score: parseFloat(d.team2_score),
  //         week: d.week,
  //         year: parseInt(d.year),
  //         matchup: `${d.team1_mascot} vs ${d.team2_mascot}`,
  //         scoringTeam: d.scoring_team,
  //       }));

  //       setData(csvData);
  //     },
  //   });
  // }, [setData, setChartData]);

  useEffect(() => {
    if (!week || !currentGame) {
      return;
    }

    // const game = data.filter(
    //   d =>
    //     d.year === year.value &&
    //     d.week === week.label &&
    //     (d.team1 === currentGame.value || d.team2 === currentGame.value)
    // );
    getJson<Score[]>(`/scores?gameId=${currentGame.value.game.gameId}`).then(game => {
      game.unshift({
        quarter: 1,
        team1: game[0].team1,
        team2: game[0].team2,
        detail: '',
        time: '',
        scoringTeamId: 0,
        scoreOrder: 0,
      });

      // if (game.length === 0) {
      //   return;
      // }

      const isTeam1Val = currentGame?.value?.team?.id === game[0].scoringTeamId;
      setIsTeam1(isTeam1Val);
      setGameData(game);
      const lineData = flow(
        groupBy<Score>(g => g.quarter),
        mapValues(g =>
          g.map<Datum>((g, i) => ({
            x: `${g.quarter}.${i}`,
            y: isTeam1Val ? g.team1.miseryIndex : g.team2.miseryIndex,
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
    });
  }, [currentGame, week]);

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
        currentGame={currentGame}
        setCurrentGame={setCurrentGame}
        week={week}
        setWeek={setWeek}
        currentGames={currentGames}
        setCurrentGames={setCurrentGames}
        weeks={weeks}
        setWeeks={setWeeks}
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
            team1={currentGame?.value?.game?.team1}
            team2={currentGame?.value?.game?.team2}
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
              team1={currentGame?.value?.game?.team1}
              team2={currentGame?.value?.game?.team2}
            />
          </Card>
        </Box>
      </Flex>
    </Styled.div>
  );
};

export default Index;
