/** @jsx jsx */
import React from 'react';
import { Card, jsx, Styled } from 'theme-ui';
import { Score } from '../models/score';
import { Team } from '../models/team';
import { getIsPositive } from '../util/util';

interface ScoreTableProps {
  gameData: Score[];
  setOverrideIndex: (overrideIndex: number | undefined) => void;
  hoveredIndex: number | undefined;
  setHoveredIndex: (overrideIndex: number | undefined) => void;
  isTeam1: boolean;
  enableHover: boolean;
  team1: Team;
  team2: Team;
}

export const ScoreTable: React.FC<ScoreTableProps> = ({
  gameData,
  setOverrideIndex,
  setHoveredIndex,
  isTeam1,
  hoveredIndex,
  enableHover,
  team1,
  team2,
}) => {
  const updateIndex = (i: number) => {
    if (enableHover) {
      setOverrideIndex(i + 1);
      setHoveredIndex(i + 1);
    }
  };
  const allScores = gameData.slice(1);
  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        padding: 0,
      }}
    >
      <Styled.table
        onMouseLeave={() => {
          setOverrideIndex(undefined);
          setHoveredIndex(undefined);
        }}
      >
        <thead>
          <Styled.tr>
            <Styled.th sx={{ width: ['15%', '15%', '15%'], paddingLeft: '5px' }}>Quarter</Styled.th>
            <Styled.th sx={{ width: ['25%', '20%', '20%'] }}>Team</Styled.th>
            <Styled.th sx={{ width: ['0%', '45%', '45%'], display: ['none', 'table-cell', 'table-cell'] }}>
              Play
            </Styled.th>
            <Styled.th sx={{ width: ['20%', '15%', '15%'] }}>{team1.originalMascot}</Styled.th>
            <Styled.th sx={{ width: ['20%', '15%', '15%'] }}>{team2.originalMascot}</Styled.th>
            <Styled.th sx={{ width: ['20%', '10%', '10%'] }}>Index</Styled.th>
          </Styled.tr>
        </thead>
        <tbody>
          {allScores.map((d, i) => {
            const score = (isTeam1 ? d.team1 : d.team2).miseryIndex;
            let nextScore = score;
            if (i < allScores.length - 1) {
              nextScore = (isTeam1 ? allScores[i + 1].team1 : allScores[i + 1].team2).miseryIndex;
            }
            return (
              <Styled.tr
                key={i}
                sx={{ bg: i + 1 === hoveredIndex ? 'hover' : 'background' }}
                onMouseMove={() => updateIndex(i)}
              >
                <Styled.td sx={{ paddingLeft: '5px' }}>{d.quarter < 5 ? d.quarter : 'OT'}</Styled.td>
                <Styled.td>{d.scoringTeamId === team1.id ? team1.originalMascot : team2.originalMascot}</Styled.td>
                <Styled.td sx={{ display: ['none', 'flex', 'flex'] }}>{d.detail}</Styled.td>
                <Styled.td>{(isTeam1 ? d.team1 : d.team2).gameScore}</Styled.td>
                <Styled.td>{(isTeam1 ? d.team2 : d.team1).gameScore}</Styled.td>
                <Styled.td
                  sx={{
                    color: getIsPositive(score, nextScore) ? 'highlightPositive' : 'highlightNegative',
                  }}
                >
                  {score}
                </Styled.td>
              </Styled.tr>
            );
          })}
        </tbody>
      </Styled.table>
    </Card>
  );
};
