/** @jsxRuntime classic */
/** @jsx jsx */
import { Datum } from '@nivo/line';
import { filter, flatMap, flow, groupBy, map, mapValues, rangeRight, uniqBy } from 'lodash/fp';
import { useEffect, useState } from 'react';
import Select, { Styles } from 'react-select';
import { Flex, jsx, useThemeUI } from 'theme-ui';
import { Score } from '../models/score';
import { IntValue, Value } from '../pages';
import { setOpacity } from '../util/util';

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
  const { theme } = useThemeUI();

  useEffect(() => {
    if (data.length === 0) {
      return;
    }

    let grouped = flow(
      filter<Score>(d => d.year === year.value && d.week === week.value),
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
  }, [week, year, data]);

  useEffect(() => {
    if (data.length === 0) {
      return;
    }

    let grouped = flow(
      filter<Score>(d => d.year === year.value),
      map(d => ({ label: d.week, value: d.week })),
      uniqBy(d => d.value)
    )(data);
    setWeeks(grouped);
    setWeek(grouped[0]);
  }, [year, data]);

  const selectStyles: Partial<Styles> = {
    control: (base, state) => ({
      ...base,
      background: theme.colors?.background,
      borderColor: setOpacity(theme.colors?.text ?? '', 0.2),
      boxShadow: state.isFocused ? `0 0 0 1px ${theme.colors?.primary}` : undefined,
      ':hover': {
        borderColor: theme.colors?.primary,
      },
    }),
    indicatorSeparator: base => ({ ...base, background: setOpacity(theme.colors?.text ?? '', 0.5) }),
    dropdownIndicator: base => ({ ...base, color: setOpacity(theme.colors?.text ?? '', 0.8) }),
    menu: base => ({
      ...base,
      background: theme.colors?.background,
    }),
    singleValue: base => ({ ...base, color: theme.colors?.text }),
    input: base => ({
      ...base,
      caretColor: theme.colors?.text,
      color: theme.colors?.text,
    }),
    option: (base, state) => {
      if (!theme.colors) {
        return base;
      }
      return {
        ...base,
        backgroundColor: state.isSelected ? (theme.colors['selected'] as string) : theme.colors?.background,
        ':hover': {
          background: theme.colors['hover'],
        },
      };
    },
  };
  return (
    <form>
      <Flex>
        <Select
          sx={{ width: 100, marginRight: 10 }}
          styles={selectStyles}
          value={year}
          onChange={(value: any) => setYear(value)}
          options={rangeRight(1922, 2021).map(y => ({ value: y, label: y }))}
        />

        <Select
          sx={{ width: 200, marginRight: 10 }}
          styles={selectStyles}
          value={week}
          options={weeks}
          onChange={(value: any) => setWeek(value)}
        />
        <Select
          sx={{ width: 500 }}
          styles={selectStyles}
          options={currentGames}
          value={currentGame}
          onChange={(value: any) => setCurrentGame(value)}
        />
      </Flex>
    </form>
  );
};
