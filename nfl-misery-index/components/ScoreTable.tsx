/** @jsxRuntime classic */
/** @jsx jsx */

import React, { useEffect } from "react";
import { Button, Card, jsx, Themed, useThemeUI } from "theme-ui";
import { MdOpenInNew } from "react-icons/md";
import { Score } from "../models/score";
import { Team } from "../models/team";
import { getIsPositive, setOpacity } from "../util/util";

interface ScoreTableProps {
  gameData: Score[];
  setOverrideIndex: (overrideIndex: number | undefined) => void;
  hoveredIndex: number | undefined;
  setHoveredIndex: (overrideIndex: number | undefined) => void;
  isTeam1: boolean;
  enableHover: boolean;
  team1: Team;
  team2: Team;
  isDetailView: boolean;
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
  isDetailView,
}) => {
  const { theme } = useThemeUI();

  const updateIndex = (i: number) => {
    if (enableHover) {
      setOverrideIndex(i + 1);
      setHoveredIndex(i + 1);
    }
  };

  const allScores = gameData.slice(1);
  const hasTime = allScores[0]?.time != null;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).getScores = () => {
      // eslint-disable-next-line no-console
      console.log(
        allScores
          .map(
            (s) =>
              `s.calculate(${s.team1.gameScore}, ${s.team2.gameScore}, ${s.quarter}, '${s.time}')`,
          )
          .join("\n"),
      );
    };
  }, [allScores]);
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
              sx={{
                // width: hasTime ? "10%" : "15%",
                paddingLeft: "5px",
              }}
            >
              Quarter
            </Themed.th>
            {hasTime && (
              <Themed.th
              // sx={{ width: "10%" }}
              >
                Time
              </Themed.th>
            )}
            <Themed.th sx={{ width: ["25%", "20%", "20%"] }}>Team</Themed.th>
            <Themed.th
              sx={{
                // width: ["0%", "25%", "25%"],
                display: ["none", "table-cell", "table-cell"],
              }}
            >
              Play
            </Themed.th>
            <Themed.th
            // sx={{ width: ["10%", "10%", "10%"] }}
            >
              {team1.originalMascot}
            </Themed.th>
            <Themed.th
            // sx={{ width: ["10%", "10%", "10%"] }}
            >
              {team2.originalMascot}
            </Themed.th>
            {isDetailView && (
              <>
                <Themed.th
                  sx={{
                    // width: ["30%", "20%", "20%"],
                    textAlign: "right",
                  }}
                >
                  Score Index
                </Themed.th>
                <Themed.th
                  sx={{
                    // width: ["20%", "10%", "10%"],
                    textAlign: "right",
                  }}
                >
                  Comeback Index
                </Themed.th>
                <Themed.th
                  sx={{
                    // width: ["20%", "10%", "10%"],
                    textAlign: "right",
                  }}
                >
                  Max Deficit
                </Themed.th>
              </>
            )}
            <Themed.th
              sx={{
                // width: ["20%", "10%", "10%"],
                textAlign: "right",
              }}
            >
              Index
            </Themed.th>
            <Themed.th />
          </Themed.tr>
        </thead>
        <tbody>
          {allScores.map((d, i) => {
            const teamScore = isTeam1 ? d.team1 : d.team2;
            // const score = team.miseryIndex;
            let nextScore = teamScore;
            if (i < allScores.length - 1) {
              nextScore = isTeam1
                ? allScores[i + 1].team1
                : allScores[i + 1].team2;
            }
            const defaultSx = {
              borderBottomColor:
                d.isLastOfQuarter && i < allScores.length - 1
                  ? setOpacity(theme.rawColors.text as string, 0.8)
                  : undefined,
            };
            return (
              <Themed.tr
                key={d.scoreOrder}
                sx={{
                  bg: i + 1 === hoveredIndex ? "hover" : "background",
                }}
                onMouseMove={() => updateIndex(i)}
              >
                <Themed.td sx={{ paddingLeft: "5px", ...defaultSx }}>
                  {d.quarter < 5 ? d.quarter : "OT"}
                </Themed.td>
                {hasTime && (
                  <Themed.td
                    sx={{ paddingLeft: "5px", whiteSpace: "pre", ...defaultSx }}
                  >
                    {d.time?.padStart(5, " ")}
                  </Themed.td>
                )}
                <Themed.td sx={defaultSx}>
                  {d.scoringTeamId === team1.id
                    ? team1.originalMascot
                    : team2.originalMascot}
                </Themed.td>
                <Themed.td
                  sx={{ display: ["none", "flex", "flex"], ...defaultSx }}
                >
                  {d.detail}
                </Themed.td>
                <Themed.td sx={defaultSx}>
                  {(isTeam1 ? d.team1 : d.team2).gameScore}
                </Themed.td>
                <Themed.td sx={defaultSx}>
                  {(isTeam1 ? d.team2 : d.team1).gameScore}
                </Themed.td>
                {isDetailView && (
                  <>
                    <Themed.td
                      sx={{
                        color: getIsPositive(
                          teamScore.scoreIndex,
                          nextScore.scoreIndex,
                        )
                          ? "highlightPositive"
                          : "highlightNegative",
                        textAlign: "right",
                        ...defaultSx,
                      }}
                    >
                      {teamScore.scoreIndex.toFixed(2)}
                    </Themed.td>
                    <Themed.td
                      sx={{
                        color: getIsPositive(
                          teamScore.comebackIndex,
                          nextScore.comebackIndex,
                        )
                          ? "highlightPositive"
                          : "highlightNegative",
                        textAlign: "right",
                        ...defaultSx,
                      }}
                    >
                      {teamScore.comebackIndex.toFixed(2)}
                    </Themed.td>
                    <Themed.td
                      sx={{
                        color: getIsPositive(
                          teamScore.maxDeficit,
                          nextScore.maxDeficit,
                        )
                          ? "highlightPositive"
                          : "highlightNegative",
                        textAlign: "right",
                        ...defaultSx,
                      }}
                    >
                      {teamScore.maxDeficit.toFixed(2)}
                    </Themed.td>
                  </>
                )}
                <Themed.td
                  sx={{
                    color: getIsPositive(
                      teamScore.miseryIndex,
                      nextScore.miseryIndex,
                    )
                      ? "highlightPositive"
                      : "highlightNegative",
                    textAlign: "right",
                    fontWeight: "bold",
                    ...defaultSx,
                  }}
                >
                  {teamScore.miseryIndex.toFixed(2)}
                </Themed.td>
              </Themed.tr>
            );
          })}
        </tbody>
      </Themed.table>
    </Card>
  );
};
