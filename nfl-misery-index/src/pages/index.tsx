import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Chart, MyResponsiveLine } from '../components/chart';
import { Score } from '../models/score';
import { Datum, Serie } from '@nivo/line';
import { takeWhile, groupBy, rangeRight } from 'lodash';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import uniq from 'lodash/fp/uniq';
import { Box, Flex } from 'rebass';
import { Label, Select } from '@rebass/forms';

const Index: React.FC<{}> = () => {
  const [data, setData] = useState<Score[]>([]);
  const [chartData, setChartData] = useState<Serie[]>([]);
  const [year, setYear] = useState(2020);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [week, setWeek] = useState('Week 1');
  const [currentGames, setCurrentGames] = useState<string[]>([]);
  const [currentGame, setCurrentGame] = useState('');

  useEffect(() => {
    Papa.parse<any>('https://raw.githubusercontent.com/aschey/nfl-data-analysis/main/data/scores_with_index.csv', {
      download: true,
      worker: true,
      header: true,
      complete: results => {
        let csvData = results.data.map<Score>(d => ({
          detail: d.Detail,
          quarter: parseFloat(d.Quarter),
          date: new Date(d.date),
          score1: Math.round(parseFloat(d.score1) * 100) / 100,
          score2: Math.round(parseFloat(d.score2) * 100) / 100,
          team1: d.team1,
          team2: d.team2,
          team1Score: parseFloat(d.team1_score),
          team2Score: parseFloat(d.team2_score),
          week: d.week,
          year: parseInt(d.year),
          matchup: `${d.team1} vs ${d.team2}`,
        }));

        setData(csvData);
      },
    });
  }, [setData, setChartData]);

  useEffect(() => {
    let grouped = flow(
      filter<Score>(d => d.year === year),
      map(d => d.week),
      uniq
    )(data);
    setWeeks(grouped);
  }, [year, data]);

  useEffect(() => {
    let grouped = flow(
      filter<Score>(d => d.year === year && d.week === week),
      map(d => d.matchup),
      uniq
    )(data);

    setCurrentGames(grouped);
  }, [week, year, data]);

  useEffect(() => {
    const game = data.filter(d => d.year === year && d.week === week && d.matchup === currentGame);

    let lineData1 = game.map<Datum>((g, i) => ({ x: `${g.quarter}.${i}`, y: g.score1 }));
    let lineData2 = game.map<Datum>((g, i) => ({ x: `${g.quarter}.${i}`, y: g.team1Score - g.team2Score }));
    let lineData3 = game.map<Datum>((g, i) => ({ x: `${g.quarter}.${i}`, y: g.team1Score }));
    let lineData4 = game.map<Datum>((g, i) => ({ x: `${g.quarter}.${i}`, y: g.team2Score }));

    setChartData([
      {
        id: 'Team 1 Index',
        color: 'hsl(121, 70%, 50%)',
        data: lineData1,
      },
      { id: 'Diff', color: 'hsl(331, 70%, 50%)', data: lineData2 },
      {
        id: 'Team 1 Score',
        color: 'hsl(201, 70%, 50%)',
        data: lineData3,
      },
      {
        id: 'Team 2 Score',
        color: 'hsl(167, 70%, 50%)',
        data: lineData4,
      },
    ]);
  }, [year, week, currentGame]);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
      <Flex>
        <Select style={{ width: 100 }} onChange={e => setYear(parseInt(e.target.value))}>
          {rangeRight(1922, 2021).map(y => (
            <option key={y}>{y}</option>
          ))}
        </Select>
        <Select style={{ width: 100 }} onChange={e => setWeek(e.target.value)}>
          {weeks.map(w => (
            <option key={w}>{w}</option>
          ))}
        </Select>
        <Select style={{ width: 500 }} onChange={e => setCurrentGame(e.target.value)}>
          {currentGames.map(c => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Flex>

      <Flex style={{ width: '100%', height: '100%' }}>
        <MyResponsiveLine data={chartData} />
      </Flex>
    </div>
  );
};

export default Index;
