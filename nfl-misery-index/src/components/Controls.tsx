/** @jsx jsx */
import { flatMap, flow, map } from 'lodash/fp';
import { useCallback, useEffect, useState } from 'react';
import { Flex, jsx } from 'theme-ui';
import { Game } from '../models/game';
import { GameTeam } from '../models/gameTeam';
import { Score } from '../models/score';
import { Value } from '../models/value';
import { Week } from '../models/week';
import { getJson } from '../util/fetchUtil';
import { AdaptiveSelect } from './AdaptiveSelect';

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
}) => {
  const [years, setYears] = useState<Value<number>[]>([]);
  const [year, setYear] = useState<Value<number>>({ label: '2020', value: 2020 });

  const updateWeek = useCallback(
    async (newWeek: Value<number>, year: Value<number>) => {
      setIsLoading(true);

      const [scores, games] = await Promise.all([
        getJson<Score[]>(`/scores?weekId=${newWeek.value}`),
        getJson<Game[]>(`/games?weekId=${newWeek.value}`),
      ]);
      setAllScores(scores);
      setWeek(newWeek);

      const matchups = flow(
        map<Game, Value<GameTeam>[]>(g => [
          {
            label: `${g.team1.originalMascot} (vs ${g.team2.originalMascot})`,
            value: { team: g.team1, game: g },
          },
          {
            label: `${g.team2.originalMascot} (vs ${g.team1.originalMascot})`,
            value: { team: g.team2, game: g },
          },
        ]),
        flatMap(g => g)
      )(games);

      setCurrentGames(matchups);
      if (matchups.length === 0) {
        return;
      }
      setCurrentGame(matchups[0]);
    },
    [setCurrentGames, setCurrentGame, setWeek, setIsLoading, setAllScores]
  );

  const updateYear = useCallback(
    async (newYear: Value<number>) => {
      setIsLoading(true);
      setYear(newYear);
      const weeks = await getJson<Week[]>(`/weeks?year=${newYear.value}`);
      const weekValues = weeks.map(w => ({ label: w.weekName, value: w.weekId }));

      setWeeks(weekValues);
      updateWeek(weekValues[0], newYear);
    },
    [setWeeks, setYear, updateWeek, setIsLoading]
  );

  useEffect(() => {
    getJson<number[]>('/years').then(allYears => {
      const yearVals = allYears.map(y => ({ label: y.toString(), value: y }));

      setYears(yearVals);
      updateYear(yearVals[0]);
    });
  }, [updateYear]);

  return (
    <form>
      <Flex sx={{ paddingLeft: 10, flexWrap: 'wrap' }}>
        <AdaptiveSelect
          sxStyles={{ marginBottom: 10, marginRight: 10 }}
          width={100}
          value={year}
          onChange={value => updateYear(value as Value<number>)}
          options={years}
        />
        <AdaptiveSelect
          sxStyles={{ marginBottom: 10, marginRight: 10 }}
          width={200}
          value={week}
          options={weeks}
          onChange={value => updateWeek(value as Value<number>, year)}
        />
        <AdaptiveSelect
          width={310}
          options={currentGames}
          value={currentGame}
          onChange={value => {
            setIsLoading(true);
            setCurrentGame(value as Value<GameTeam>);
          }}
        />
      </Flex>
    </form>
  );
};
