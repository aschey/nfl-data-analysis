/** @jsxRuntime classic */
/** @jsx jsx */
import { filter, flatMap, flow, map, rangeRight, uniqBy } from 'lodash/fp';
import { useCallback, useEffect } from 'react';
import { Flex, jsx } from 'theme-ui';
import { Score } from '../models/score';
import { IntValue, Value } from '../pages';
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
  data: Score[];
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
  data,
}) => {
  const updateWeek = useCallback(
    (newWeek: Value, year: IntValue) => {
      setWeek(newWeek);
      const grouped = flow(
        filter<Score>(d => d.year === year.value && d.week === newWeek.value),
        uniqBy(d => d.matchup),
        map(d => [
          { label: `${d.team1} (vs ${d.team2})`, value: d.team1 },
          { label: `${d.team2} (vs ${d.team1})`, value: d.team2 },
        ]),
        flatMap(d => d)
      )(data);

      setCurrentGames(grouped);
      if (grouped.length === 0) {
        return;
      }
      setCurrentGame(grouped[0]);
    },
    [data, setCurrentGames, setCurrentGame, setWeek]
  );

  const updateYear = useCallback(
    (newYear: IntValue) => {
      setYear(newYear);
      const grouped = flow(
        filter<Score>(d => d.year === newYear.value),
        map(d => ({ label: d.week, value: d.week })),
        uniqBy(d => d.value)
      )(data);

      setWeeks(grouped);
      updateWeek(grouped[0], newYear);
    },
    [data, setWeeks, setYear, updateWeek]
  );

  useEffect(() => {
    updateYear({ value: 2020, label: 2020 });
  }, [updateYear]);

  return (
    <form>
      <Flex sx={{ paddingLeft: 10, flexWrap: 'wrap' }}>
        <AdaptiveSelect
          sxStyles={{ marginBottom: 10, marginRight: 10 }}
          width={100}
          value={year}
          onChange={value => updateYear(value as IntValue)}
          options={rangeRight(1922, 2021).map(y => ({ value: y, label: y }))}
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
