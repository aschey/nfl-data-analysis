/** @jsxRuntime classic */
/** @jsx jsx */
import React from 'react';
import { Card, jsx, Styled } from 'theme-ui';
import { Score } from '../models/score';
import { getIsPositive } from '../util/util';

interface ScoreTableProps {
  gameData: Score[];
  setOverrideIndex: (overrideIndex: number | undefined) => void;
  hoveredIndex: number | undefined;
  setHoveredIndex: (overrideIndex: number | undefined) => void;
  isTeam1: boolean;
  enableHover: boolean;
}

export const ScoreTable: React.FC<ScoreTableProps> = ({
  gameData,
  setOverrideIndex,
  setHoveredIndex,
  isTeam1,
  hoveredIndex,
  enableHover,
}) => {
  const updateIndex = (i: number) => {
    if (enableHover) {
      setOverrideIndex(i + 1);
      setHoveredIndex(i + 1);
    }
  };
  const allScores = gameData.slice(1);
  return (
    <React.Fragment>
      {gameData.length > 0 ? (
        <Card sx={{ width: '100%' }}>
          <Styled.table
            onMouseLeave={() => {
              setOverrideIndex(undefined);
              setHoveredIndex(undefined);
            }}
          >
            <thead>
              <Styled.tr>
                <Styled.th style={{ width: '5%' }}>Quarter</Styled.th>
                <Styled.th style={{ width: '10%' }}>Team</Styled.th>
                <Styled.th>Play</Styled.th>
                <Styled.th style={{ width: '5%' }}>{gameData[0].team1}</Styled.th>
                <Styled.th style={{ width: '5%' }}>{gameData[0].team2}</Styled.th>
                <Styled.th style={{ width: '10%' }}>Index</Styled.th>
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
    </React.Fragment>
  );
};
