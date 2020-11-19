/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import { ScoreLine } from '../components/Chart';
import { Score } from '../models/score';
import { Datum, Serie } from '@nivo/line';
import { takeWhile, rangeRight, random } from 'lodash';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import uniqBy from 'lodash/fp/uniqBy';
import keys from 'lodash/fp/keys';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import flatMap from 'lodash/fp/flatMap';
import reduce from 'lodash/fp/reduce';
import { Label, Box, Flex, Styled, Card, useThemeUI } from 'theme-ui';
import Select, { OptionsType, Styles, ValueType } from 'react-select';
import { getIsPositive, setOpacity } from '../util/util';

interface Value {
  label: string;
  value: string;
}
interface IntValue {
  label: number;
  value: number;
}

const Index: React.FC<{}> = () => {
  const [data, setData] = useState<Score[]>([]);
  const [chartData, setChartData] = useState<Serie[]>([]);
  const [gameData, setGameData] = useState<Score[]>([]);
  const [year, setYear] = useState<IntValue>({ value: 2020, label: 2020 });
  const [weeks, setWeeks] = useState<Value[]>([]);
  const [week, setWeek] = useState<Value>({ label: 'Week 1', value: 'Week 1' });
  const [currentGames, setCurrentGames] = useState<Value[]>([]);
  const [currentGame, setCurrentGame] = useState<Value>({ label: '', value: '' });
  const [isTeam1, setIsTeam1] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);
  const [overrideIndex, setOverrideIndex] = useState<number | undefined>(undefined);
  const [enableHover, setEnableHover] = useState(true);
  const timeout = useRef<NodeJS.Timeout>();

  const { theme } = useThemeUI();

  useEffect(() => {
    Papa.parse<any>('https://nfl-index-data.s3.us-east-2.amazonaws.com/scores_with_index.csv', {
      download: true,
      worker: true,
      header: true,
      complete: results => {
        let csvData = results.data.map<Score>(d => ({
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
    let isTeam1Val = currentGame.value === game[0].team1;
    setIsTeam1(isTeam1Val);
    setGameData(game);
    let lineData = flow(
      groupBy<Score>(g => g.quarter),
      mapValues(g => g.map<Datum>((g, i) => ({ x: `${g.quarter}.${i}`, y: isTeam1Val ? g.score1 : g.score2 }))),
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
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    // Enabling hover during the transition animation makes it look weird
    timeout.current = setTimeout(() => setEnableHover(true), 750);
  }, [year, week, currentGame]);

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

  const updateIndex = (i: number) => {
    if (enableHover) {
      setOverrideIndex(i + 1);
      setHoveredIndex(i + 1);
    }
  };
  const allScores = gameData.slice(1);
  return (
    <div style={{ position: 'fixed', top: 10, left: 10, width: 'calc(100% - 10px)', height: '100%' }}>
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
      <Flex style={{ width: '100%', height: '100%' }}>
        <div style={{ fontSize: 14, marginTop: 50, marginRight: 10, width: 1000 }}>
          {gameData.length > 0 ? (
            <Card>
              <Styled.table
                onMouseLeave={() => {
                  setOverrideIndex(undefined);
                  setHoveredIndex(undefined);
                }}
              >
                <thead>
                  <Styled.tr>
                    <Styled.th style={{ width: 75 }}>Quarter</Styled.th>
                    <Styled.th style={{ width: 75 }}>Team</Styled.th>
                    <Styled.th>Play</Styled.th>
                    <Styled.th style={{ width: 75 }}>{gameData[0].team1}</Styled.th>
                    <Styled.th style={{ width: 75 }}>{gameData[0].team2}</Styled.th>
                    <Styled.th style={{ width: 75 }}>Index</Styled.th>
                  </Styled.tr>
                </thead>
                <tbody>
                  {allScores.map((d, i) => {
                    const score = isTeam1 ? d.score1 : d.score2;
                    let nextScore = score;
                    if (i < allScores.length - 1) {
                      nextScore = isTeam1 ? allScores[i + 1].score1 : allScores[i + 1].score2;
                    }
                    return (
                      <Styled.tr
                        key={i}
                        sx={{ bg: i + 1 === hoveredIndex ? 'hover' : 'background' }}
                        onMouseMove={() => {
                          updateIndex(i);
                        }}
                      >
                        <Styled.td>{d.quarter}</Styled.td>
                        <Styled.td>{d.scoringTeam}</Styled.td>
                        <Styled.td>{d.detail}</Styled.td>
                        <Styled.td>{d.team1Score}</Styled.td>
                        <Styled.td>{d.team2Score}</Styled.td>
                        <Styled.td
                          sx={{ color: getIsPositive(score, nextScore) ? 'highlightPositive' : 'highlightNegative' }}
                        >
                          {score}
                        </Styled.td>
                      </Styled.tr>
                    );
                  })}
                </tbody>
              </Styled.table>
            </Card>
          ) : null}
        </div>
        <Card sx={{ width: '100%', marginLeft: 10, marginRight: 10, marginTop: 50, marginBottom: 70 }}>
          <ScoreLine
            data={chartData}
            scoreData={gameData}
            setIndex={setHoveredIndex}
            overrideIndex={overrideIndex}
            isTeam1={isTeam1}
          />
        </Card>
      </Flex>
    </div>
  );
};

export default Index;
