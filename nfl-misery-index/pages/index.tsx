/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Box, Flex, Themed, Button } from "theme-ui";
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
import { AdaptiveSelect } from "../components/AdaptiveSelect";

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
  const [lineDataMode, setLineDataMode] = useState("miseryindex");

  const prevGame = usePrevious(currentGame);
  const prevMode = usePrevious(lineDataMode);

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
  const [isDetailView, setIsDetailView] = useState(false);

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
    if (
      !currentGame ||
      (prevGame?.value === currentGame.value && prevMode === lineDataMode)
    ) {
      return;
    }

    setEnableHover(false);

    const scores = allScores.filter(
      (s) => s.gameId === currentGame.value.game.gameId,
    );
    scores.unshift({
      gameId: currentGame.value.game.gameId,
      quarter: 1,
      team1: {
        gameScore: 0,
        miseryIndex: 0,
        scoreIndex: 0,
        comebackIndex: 0,
        maxDeficit: 0,
      },
      team2: {
        gameScore: 0,
        miseryIndex: 0,
        scoreIndex: 0,
        comebackIndex: 0,
        maxDeficit: 0,
      },
      detail: "",
      time: "",
      scoringTeamId: 0,
      scoreOrder: 1.0,
      isLastOfQuarter: false,
    });

    const { game } = currentGame.value;
    const isTeam1Val = currentGame.value.team.id === game.team1.id;
    setIsTeam1(isTeam1Val);
    setPrimaryTeam(isTeam1Val ? game.team1 : game.team2);
    setSecondaryTeam(isTeam1Val ? game.team2 : game.team1);
    setGameData(scores);
    const lineData = scores.map((g) => ({
      x: g.scoreOrder,
      y: (() => {
        const teamScore = isTeam1Val ? g.team1 : g.team2;

        switch (lineDataMode) {
          case "miseryindex":
            return teamScore.miseryIndex;
          case "scoreindex":
            return teamScore.scoreIndex;
          case "maxdeficit":
            return teamScore.maxDeficit;
          case "comebackindex":
            return teamScore.comebackIndex;
          default:
            return 0.0;
        }
      })(),
    }));

    setIsLoading(false);
    setChartData([
      {
        key: "data",
        id: "data",
        data: lineData,
      },
    ]);
  }, [currentGame, setIsLoading, allScores, prevGame, prevMode, lineDataMode]);

  const onAnimationEnd = () => setEnableHover(true);

  const cardItemPadding = [
    "10px 10px 0 10px",
    "10px 10px 0 10px",
    "50px 10px 0 10px",
  ];

  const dataOptions = [
    { label: "Misery Index", value: "miseryindex" },
    { label: "Score Index", value: "scoreindex" },
    { label: "Comeback Index", value: "comebackindex" },
    { label: "Max Deficit", value: "maxdeficit" },
  ];

  return (
    <Overlay isLoading={isLoading}>
      <Themed.div
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: [
            `calc(100% - ${controlHeightTwoRows}px)`,
            `calc(100% - ${controlHeightTwoRows}px)`,
            `calc(100% - ${controlHeight}px - 100px)`,
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
        <Button variant="secondary" onClick={() => setIsDetailView(true)}>
          Details
        </Button>
        <Button variant="secondary" onClick={() => setIsDetailView(false)}>
          Overview
        </Button>
        <AdaptiveSelect
          options={dataOptions}
          value={dataOptions.find((o) => o.value === lineDataMode)}
          onChange={(value) => {
            setLineDataMode(value.value);
          }}
          width={200}
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
              width: ["100%", "100%", isDetailView ? "100%" : 1000],
              height: isDetailView ? "100%" : ["40%", "40%", "100%"],
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
              isDetailView={isDetailView}
            />
          </Flex>
          <Box
            sx={{
              width: !isDetailView ? "100%" : 0,
              height: ["60%", "60%", "100%"],
              padding: cardItemPadding,
            }}
          >
            {!isDetailView && (
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
            )}
          </Box>
        </Flex>
      </Themed.div>
    </Overlay>
  );
};

export const getStaticProps = async (): Promise<{ props: IndexProps }> => {
  const apiUrl = process.env.API_URL;
  const years = await getJson<number[]>("/years", apiUrl);
  const yearVals = years.map((y) => ({ label: y.toString(), value: y }));
  const weeks = await getWeeks(years[0], apiUrl);
  const scores = await getScores(weeks[0].value, apiUrl);
  const matchups = await getMatchups(weeks[0].value, apiUrl);

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
