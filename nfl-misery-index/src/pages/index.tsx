/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useEffect, useState } from 'react';
import { ScoreLine } from '../components/Chart';
import { Score } from '../models/score';
import { Serie } from '@nivo/line';
import { Box, Flex, Styled, Card } from 'theme-ui';
import { Controls } from '../components/Controls';
import { ScoreTable } from '../components/ScoreTable';
import { getJson } from '../util/fetchUtil';
import { Value } from '../models/value';
import { GameTeam } from '../models/gameTeam';

const Index: React.FC<Record<string, unknown>> = () => {
  const [chartData, setChartData] = useState<Serie[]>([]);
  const [gameData, setGameData] = useState<Score[]>([]);
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

  useEffect(() => {
    if (!week || !currentGame) {
      return;
    }

    setEnableHover(false);
    getJson<Score[]>(`/scores?gameId=${currentGame.value.game.gameId}`).then(game => {
      game.unshift({
        quarter: 1,
        team1: { gameScore: 0, miseryIndex: 0 },
        team2: { gameScore: 0, miseryIndex: 0 },
        detail: '',
        time: '',
        scoringTeamId: 0,
        scoreOrder: 1.0,
      });

      const isTeam1Val = currentGame?.value?.team?.id === currentGame?.value?.game?.team1?.id;
      setIsTeam1(isTeam1Val);
      setGameData(game);
      const lineData = game.map(g => ({
        x: g.scoreOrder,
        y: isTeam1Val ? g.team1.miseryIndex : g.team2.miseryIndex,
      }));

      setChartData([
        {
          key: 'data',
          id: 'data',
          data: lineData,
        },
      ]);
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
