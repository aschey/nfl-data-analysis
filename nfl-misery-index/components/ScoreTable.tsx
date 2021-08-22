/** @jsxRuntime classic */
/** @jsx jsx */

import React from "react";
import { Card, jsx, Themed } from "theme-ui";
import { Score } from "../models/score";
import { Team } from "../models/team";
import { getIsPositive } from "../util/util";

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
        width: "100%",
        overflowY: "auto",
        padding: 0,
      }}
    >
      <Themed.table
        onMouseLeave={() => {
          setOverrideIndex(undefined);
          setHoveredIndex(undefined);
        }}
      >
        <thead>
          <Themed.tr>
            <Themed.th
              sx={{ width: ["15%", "15%", "15%"], paddingLeft: "5px" }}
            >
              Quarter
            </Themed.th>
            <Themed.th sx={{ width: ["25%", "20%", "20%"] }}>Team</Themed.th>
            <Themed.th
              sx={{
                width: ["0%", "45%", "45%"],
                display: ["none", "table-cell", "table-cell"],
              }}
            >
              Play
            </Themed.th>
            <Themed.th sx={{ width: ["20%", "15%", "15%"] }}>
              {team1.originalMascot}
            </Themed.th>
            <Themed.th sx={{ width: ["20%", "15%", "15%"] }}>
              {team2.originalMascot}
            </Themed.th>
            <Themed.th sx={{ width: ["20%", "10%", "10%"] }}>Index</Themed.th>
          </Themed.tr>
        </thead>
        <tbody>
          {allScores.map((d, i) => {
            const score = (isTeam1 ? d.team1 : d.team2).miseryIndex;
            let nextScore = score;
            if (i < allScores.length - 1) {
              nextScore = (
                isTeam1 ? allScores[i + 1].team1 : allScores[i + 1].team2
              ).miseryIndex;
            }
            return (
              <Themed.tr
                key={d.scoreOrder}
                sx={{
                  bg: i + 1 === hoveredIndex ? "hover" : "background",
                }}
                onMouseMove={() => updateIndex(i)}
              >
                <Themed.td sx={{ paddingLeft: "5px" }}>
                  {d.quarter < 5 ? d.quarter : "OT"}
                </Themed.td>
                <Themed.td>
                  {d.scoringTeamId === team1.id
                    ? team1.originalMascot
                    : team2.originalMascot}
                </Themed.td>
                <Themed.td sx={{ display: ["none", "flex", "flex"] }}>
                  {d.detail}
                </Themed.td>
                <Themed.td>{(isTeam1 ? d.team1 : d.team2).gameScore}</Themed.td>
                <Themed.td>{(isTeam1 ? d.team2 : d.team1).gameScore}</Themed.td>
                <Themed.td
                  sx={{
                    color: getIsPositive(score, nextScore)
                      ? "highlightPositive"
                      : "highlightNegative",
                  }}
                >
                  {score}
                </Themed.td>
              </Themed.tr>
            );
          })}
        </tbody>
      </Themed.table>
    </Card>
  );
};