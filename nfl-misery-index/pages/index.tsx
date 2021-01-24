/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Box, Flex, Styled } from "theme-ui";
import { useEffect, useState } from "react";
import { Serie } from "@nivo/line";
import { Score } from "../models/score";
import { ScoreLine } from "../components/ScoreLine";
import { Controls } from "../components/Controls";
import { ScoreTable } from "../components/ScoreTable";
import { Value } from "../models/value";
import { GameTeam } from "../models/gameTeam";
import { Team } from "../models/team";
import { Overlay } from "../components/Overlay";
import { usePrevious } from "../hooks/usePrevious";
import { getJson } from "../util/fetchUtil";
import { getMatchups, getScores, getWeeks } from "../util/gameDataUtil";

interface IndexProps {
  initCurrentGames: Value<GameTeam>[];
  initAllScores: Score[];
  initWeeks: Value<number>[];
  initYears: Value<number>[];
}

const Index: React.FC<IndexProps> = ({
  initCurrentGames,
  initAllScores,
  initWeeks,
  initYears,
}) => {
  const [chartData, setChartData] = useState<Serie[]>([]);
  const [gameData, setGameData] = useState<Score[]>([]);
  const [allScores, setAllScores] = useState<Score[]>([]);
  const [weeks, setWeeks] = useState<Value<number>[]>([]);
  const [week, setWeek] = useState<Value<number>>({
    label: "Week 1",
    value: 0,
  });
  const [currentGames, setCurrentGames] = useState<Value<GameTeam>[]>([]);
  const [currentGame, setCurrentGame] = useState<Value<GameTeam>>();
  const [isTeam1, setIsTeam1] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const prevGame = usePrevious(currentGame);

  const [primaryTeam, setPrimaryTeam] = useState<Team>({
    originalCity: "",
    city: "",
    originalMascot: "",
    mascot: "",
    id: 0,
  });
  const [secondaryTeam, setSecondaryTeam] = useState<Team>({
    originalCity: "",
    city: "",
    originalMascot: "",
    mascot: "",
    id: 0,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(
    undefined,
  );
  const [overrideIndex, setOverrideIndex] = useState<number | undefined>(
    undefined,
  );
  const [enableHover, setEnableHover] = useState(true);

  const selectHeight = 38;
  const controlHeight = selectHeight + 10;
  const controlHeightTwoRows = selectHeight * 2 + 10;

  useEffect(() => {
    setCurrentGames(initCurrentGames);
    setAllScores(initAllScores);
    setWeeks(initWeeks);
    setWeek(initWeeks[0]);
    setCurrentGames(initCurrentGames);
    setCurrentGame(initCurrentGames[0]);
  }, [initAllScores, initCurrentGames, initWeeks]);

  useEffect(() => {
    // Only update if current game has changed
    if (!currentGame || prevGame?.value === currentGame.value) {
      return;
    }

    setEnableHover(false);

    const scores = allScores.filter(
      (s) => s.gameId === currentGame.value.game.gameId,
    );
    scores.unshift({
      gameId: currentGame.value.game.gameId,
      quarter: 1,
      team1: { gameScore: 0, miseryIndex: 0 },
      team2: { gameScore: 0, miseryIndex: 0 },
      detail: "",
      time: "",
      scoringTeamId: 0,
      scoreOrder: 1.0,
    });

    const { game } = currentGame.value;
    const isTeam1Val = currentGame.value.team.id === game.team1.id;
    setIsTeam1(isTeam1Val);
    setPrimaryTeam(isTeam1Val ? game.team1 : game.team2);
    setSecondaryTeam(isTeam1Val ? game.team2 : game.team1);
    setGameData(scores);
    const lineData = scores.map((g) => ({
      x: g.scoreOrder,
      y: isTeam1Val ? g.team1.miseryIndex : g.team2.miseryIndex,
    }));
    setIsLoading(false);
    setChartData([
      {
        key: "data",
        id: "data",
        data: lineData,
      },
    ]);
  }, [currentGame, setIsLoading, allScores, prevGame]);

  const onAnimationEnd = () => setEnableHover(true);

  const cardItemPadding = [
    "10px 10px 0 10px",
    "10px 10px 0 10px",
    "50px 10px 0 10px",
  ];

  return (
    <Overlay isLoading={isLoading}>
      <Styled.div
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: [
            `calc(100% - ${controlHeightTwoRows}px)`,
            `calc(100% - ${controlHeightTwoRows}px)`,
            `calc(100% - ${controlHeight}px)`,
          ],
          padding: "10px 0",
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
          setAllScores={setAllScores}
          setIsLoading={setIsLoading}
          years={initYears}
        />
        <Flex
          sx={{
            width: "100%",
            height: "100%",
            flexDirection: ["column", "column", "row"],
          }}
        >
          <Flex
            sx={{
              fontSize: 14,
              padding: cardItemPadding,
              width: ["100%", "100%", 1000],
              height: ["40%", "40%", "100%"],
            }}
          >
            <ScoreTable
              gameData={gameData}
              setOverrideIndex={setOverrideIndex}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
              isTeam1={isTeam1}
              enableHover={enableHover}
              team1={primaryTeam}
              team2={secondaryTeam}
            />
          </Flex>
          <Box
            sx={{
              width: "100%",
              height: ["60%", "60%", "100%"],
              padding: cardItemPadding,
            }}
          >
            <ScoreLine
              data={chartData}
              scoreData={gameData}
              setIndex={setHoveredIndex}
              overrideIndex={overrideIndex}
              isTeam1={isTeam1}
              onAnimationEnd={onAnimationEnd}
              team1={primaryTeam}
              team2={secondaryTeam}
            />
          </Box>
        </Flex>
      </Styled.div>
    </Overlay>
  );
};

export const getStaticProps = async (): Promise<{ props: IndexProps }> => {
  const years = await getJson<number[]>("/years");
  const yearVals = years.map((y) => ({ label: y.toString(), value: y }));
  const weeks = await getWeeks(years[0]);
  const scores = await getScores(weeks[0].value);
  const matchups = await getMatchups(weeks[0].value);

  return {
    props: {
      initAllScores: scores,
      initCurrentGames: matchups,
      initWeeks: weeks,
      initYears: yearVals,
    },
  };
};

export default Index;
