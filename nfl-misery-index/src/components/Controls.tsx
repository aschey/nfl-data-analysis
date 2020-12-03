/** @jsxRuntime classic */
/** @jsx jsx */
import { filter, flatMap, flow, map, rangeRight, uniqBy } from 'lodash/fp';
import { useCallback, useEffect, useState } from 'react';
import { Flex, jsx } from 'theme-ui';
import { Game } from '../models/game';
import { Score } from '../models/score';
import { Week } from '../models/week';
import { IntValue, Value } from '../pages';
import { getJson } from '../util/fetchUtil';
import { AdaptiveSelect } from './AdaptiveSelect';

interface ControlProps {
  week: Value;
  setWeek: (week: Value) => void;
  weeks: Value[];
  setWeeks: (weeks: Value[]) => void;
  year: IntValue;
  setYear: (year: IntValue) => void;
  currentGames: Value[];
  currentGame: Value;
  setCurrentGame: (currentGame: Value) => void;
  setCurrentGames: (currentGames: Value[]) => void;
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
  year,
  setYear,
}) => {
  const [years, setYears] = useState<IntValue[]>([]);

  const updateWeek = useCallback(
    async (newWeek: Value, year: IntValue) => {
      setWeek(newWeek);
      const games = await getJson<Game[]>(`/games?weekId=${newWeek.value}`);
      const matchups = flow(
        map<Game, Value[]>(g => [
          {
            label: `${g.team1.originalMascot} (vs ${g.team2.originalMascot})`,
            value: g.team1.originalMascot,
          },
          {
            label: `${g.team2.originalMascot} (vs ${g.team1.originalMascot})`,
            value: g.team2.originalMascot,
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
    [setCurrentGames, setCurrentGame, setWeek]
  );

  const updateYear = useCallback(
    async (newYear: IntValue) => {
      setYear(newYear);
      const weeks = await getJson<Week[]>(`/weeks?year=${newYear.value}`);
      const weekValues = weeks.map(w => ({ label: w.weekName, value: w.weekId }));

      setWeeks(weekValues);
      updateWeek(weekValues[0], newYear);
    },
    [setWeeks, setYear, updateWeek]
  );

  useEffect(() => {
    getJson<number[]>('/years').then(allYears => {
      const yearVals = allYears.map(y => ({ label: y, value: y }));

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
          onChange={value => updateYear(value as IntValue)}
          options={years}
        />
        <AdaptiveSelect
          sxStyles={{ marginBottom: 10, marginRight: 10 }}
          width={200}
          value={week}
          options={weeks}
          onChange={value => updateWeek(value as Value, year)}
        />
        <AdaptiveSelect
          width={310}
          options={currentGames}
          value={currentGame}
          onChange={value => setCurrentGame(value as Value)}
        />
      </Flex>
    </form>
  );
};
