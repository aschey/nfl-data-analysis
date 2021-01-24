/** @jsxRuntime classic */
/** @jsx jsx */

import { flatMap, flow, map } from "lodash/fp";
import { useCallback, useState } from "react";
import { Flex, jsx } from "theme-ui";
import { Game } from "../models/game";
import { GameTeam } from "../models/gameTeam";
import { Score } from "../models/score";
import { Value } from "../models/value";
import { Week } from "../models/week";
import { getJson } from "../util/fetchUtil";
import { AdaptiveSelect } from "./AdaptiveSelect";

interface ControlProps {
  week: Value<number>;
  setWeek: (week: Value<number>) => void;
  weeks: Value<number>[];
  setWeeks: (weeks: Value<number>[]) => void;
  currentGames: Value<GameTeam>[];
  currentGame: Value<GameTeam> | undefined;
  setCurrentGame: (currentGame: Value<GameTeam>) => void;
  setCurrentGames: (currentGames: Value<GameTeam>[]) => void;
  setAllScores: (allScores: Score[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  years: Value<number>[];
}

export const Controls: React.FC<ControlProps> = ({
  week,
  setWeek,
  weeks,
  setWeeks,
  currentGames,
  currentGame,
  setCurrentGame,
  setCurrentGames,
  setAllScores,
  setIsLoading,
  years,
}) => {
  const [year, setYear] = useState<Value<number>>({
    label: "2020",
    value: 2020,
  });

  const updateWeek = useCallback(
    async (newWeek: Value<number>) => {
      setIsLoading(true);

      const [scores, games] = await Promise.all([
        getJson<Score[]>(`/scores?weekId=${newWeek.value}`),
        getJson<Game[]>(`/games?weekId=${newWeek.value}`),
      ]);
      setAllScores(scores);
      setWeek(newWeek);

      const matchups = flow(
        map<Game, Value<GameTeam>[]>((g) => [
          {
            label: `${g.team1.originalMascot} (vs ${g.team2.originalMascot})`,
            value: { team: g.team1, game: g },
          },
          {
            label: `${g.team2.originalMascot} (vs ${g.team1.originalMascot})`,
            value: { team: g.team2, game: g },
          },
        ]),
        flatMap((g) => g),
      )(games);

      setCurrentGames(matchups);
      if (matchups.length === 0) {
        return;
      }
      setCurrentGame(matchups[0]);
    },
    [setCurrentGames, setCurrentGame, setWeek, setIsLoading, setAllScores],
  );

  const updateYear = useCallback(
    async (newYear: Value<number>) => {
      setIsLoading(true);
      setYear(newYear);
      const newWeeks = await getJson<Week[]>(`/weeks?year=${newYear.value}`);
      const weekValues = newWeeks.map((w) => ({
        label: w.weekName,
        value: w.weekId,
      }));

      setWeeks(weekValues);
      updateWeek(weekValues[0]);
    },
    [setWeeks, setYear, updateWeek, setIsLoading],
  );

  return (
    <form>
      <Flex sx={{ paddingLeft: 10, flexWrap: "wrap" }}>
        <AdaptiveSelect
          sxStyles={{ marginBottom: 10, marginRight: 10 }}
          width={100}
          value={year}
          onChange={(value) => updateYear(value as Value<number>)}
          options={years}
        />
        <AdaptiveSelect
          sxStyles={{ marginBottom: 10, marginRight: 10 }}
          width={200}
          value={week}
          options={weeks}
          onChange={(value) => updateWeek(value as Value<number>)}
        />
        <AdaptiveSelect
          width={310}
          options={currentGames}
          value={currentGame}
          onChange={(value) => {
            setIsLoading(true);
            setCurrentGame(value as Value<GameTeam>);
          }}
        />
      </Flex>
    </form>
  );
};
