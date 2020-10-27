import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { ColoredSerie, ScoreLine } from '../components/chart';
import { Score } from '../models/score';
import { Datum, Serie } from '@nivo/line';
import { takeWhile, rangeRight, random } from 'lodash';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import uniq from 'lodash/fp/uniq';
import keys from 'lodash/fp/keys';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import flatMap from 'lodash/fp/flatMap';
import reduce from 'lodash/fp/reduce';
import { Label, Select, Box, Flex, Styled, Card } from 'theme-ui';

const Index: React.FC<{}> = () => {
  const [data, setData] = useState<Score[]>([]);
  const [chartData, setChartData] = useState<ColoredSerie[]>([]);
  const [gameData, setGameData] = useState<Score[]>([]);
  const [year, setYear] = useState(2020);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [week, setWeek] = useState('Week 1');
  const [currentGames, setCurrentGames] = useState<string[]>([]);
  const [currentGame, setCurrentGame] = useState('');

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
          team1: d.team1,
          team2: d.team2,
          team1Score: parseFloat(d.team1_score),
          team2Score: parseFloat(d.team2_score),
          week: d.week,
          year: parseInt(d.year),
          matchup: `${d.team1} vs ${d.team2}`,
          scoringTeam: d.Tm,
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
    setWeek(grouped[0]);
  }, [year, data]);

  useEffect(() => {
    let grouped = flow(
      filter<Score>(d => d.year === year && d.week === week),
      map(d => d.matchup),
      uniq
    )(data);

    setCurrentGames(grouped);
    setCurrentGame(grouped[0]);
  }, [week, year, data]);

  useEffect(() => {
    const game = data.filter(d => d.year === year && d.week === week && d.matchup === currentGame);
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
    setGameData(game);
    let lineData1 = flow(
      groupBy<Score>(g => g.quarter),
      mapValues(g => g.map<Datum>((g, i) => ({ x: `${g.quarter}.${i}`, y: g.score1 }))),
      flatMap(g => g)
    )(game) as Datum[];
    let lineData2 = flow(
      groupBy<Score>(g => g.quarter),
      mapValues(g => g.map<Datum>((g, i) => ({ x: `${g.quarter}.${i}`, y: g.score2 }))),
      flatMap(g => g)
    )(game) as Datum[];

    setChartData([
      {
        id: 'team1',
        color: '#A9E67E',
        data: lineData1,
      },
      {
        id: 'team2',
        color: '#5BFC9A',
        data: lineData2,
      },
    ]);
  }, [year, week, currentGame]);
  return (
    <div style={{ position: 'fixed', top: 10, left: 0, width: '100%', height: '100%' }}>
      <form>
        <Flex>
          <Select style={{ width: 100 }} onChange={e => setYear(parseInt(e.target.value))}>
            {rangeRight(1922, 2021).map(y => (
              <option key={y}>{y}</option>
            ))}
          </Select>
          <Select style={{ width: 200 }} onChange={e => setWeek(e.target.value)}>
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
      </form>
      <Flex style={{ width: '100%', height: '100%' }}>
        <div style={{ fontSize: 14, marginTop: 30, marginLeft: 10, marginRight: 10, width: 1000 }}>
          {gameData.length > 0 ? (
            <Card>
              <Styled.table>
                <thead>
                  <Styled.tr>
                    <Styled.th style={{ width: 75 }}>Quarter</Styled.th>
                    <Styled.th style={{ width: 75 }}>Team</Styled.th>
                    <Styled.th>Play</Styled.th>
                    <Styled.th style={{ width: 75 }}>{gameData[0].team1}</Styled.th>
                    <Styled.th style={{ width: 75 }}>{gameData[0].team2}</Styled.th>
                    <Styled.th style={{ width: 75 }}>{gameData[0].team1} Index</Styled.th>
                    <Styled.th style={{ width: 75 }}>{gameData[0].team2} Index</Styled.th>
                  </Styled.tr>
                </thead>
                <tbody>
                  {gameData.slice(1).map((d, i) => (
                    <Styled.tr key={i}>
                      <Styled.td>{d.quarter}</Styled.td>
                      <Styled.td>{d.scoringTeam}</Styled.td>
                      <Styled.td>{d.detail}</Styled.td>
                      <Styled.td>{d.team1Score}</Styled.td>
                      <Styled.td>{d.team2Score}</Styled.td>
                      <Styled.td>{d.score1}</Styled.td>
                      <Styled.td>{d.score2}</Styled.td>
                    </Styled.tr>
                  ))}
                </tbody>
              </Styled.table>
            </Card>
          ) : null}
        </div>
        <Card style={{ width: '100%', marginLeft: 10, marginRight: 10, marginTop: 30, marginBottom: 70 }}>
          <ScoreLine data={chartData} scoreData={gameData} />
        </Card>
      </Flex>
    </div>
  );
};

export default Index;
