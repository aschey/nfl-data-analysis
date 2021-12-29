/** @jsxRuntime classic */
/** @jsx jsx */

import React, { useEffect, useState } from "react";
import { Button, Card, jsx, Themed, useThemeUI, Text, Styled } from "theme-ui";
import { MdOpenInNew } from "react-icons/md";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle,
} from "@mattjennings/react-modal";
import { Score } from "../models/score";
import { Team } from "../models/team";
import { getIsPositive, setOpacity } from "../util/util";
import { TeamScore } from "../models/teamScore";

const ScoreDetails: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  teamScore: TeamScore;
}> = ({ isOpen, setIsOpen, teamScore }) => {
  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)} sx={{ height: 300 }}>
      {({ onClose }) => (
        <>
          <ModalTitle>
            <Text
              sx={{
                fontSize: 2,
                fontWeight: "medium",
                paddingBottom: 1,
              }}
            >
              Score Details
            </Text>
          </ModalTitle>
          <ModalContent>
            <Themed.table>
              <thead>
                <Themed.tr>
                  <Themed.th>Category</Themed.th>
                  <Themed.th>Value</Themed.th>
                </Themed.tr>
              </thead>
              <tbody>
                <Themed.tr>
                  <Themed.td>Score Index</Themed.td>
                  <Themed.td>{teamScore.scoreIndex.toFixed(2)}</Themed.td>
                </Themed.tr>
                <Themed.tr>
                  <Themed.td>Comeback Index</Themed.td>
                  <Themed.td>{teamScore.comebackIndex.toFixed(2)}</Themed.td>
                </Themed.tr>
                <Themed.tr>
                  <Themed.td>Max Deficit</Themed.td>
                  <Themed.td>{teamScore.maxDeficit}</Themed.td>
                </Themed.tr>
                <Themed.tr>
                  <Themed.td>Misery Index</Themed.td>
                  <Themed.td>{teamScore.miseryIndex.toFixed(2)}</Themed.td>
                </Themed.tr>
              </tbody>
            </Themed.table>
          </ModalContent>
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={onClose}
              sx={{ marginBottom: "1rem" }}
            >
              OK
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
};

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
  const { theme } = useThemeUI();
  const [modalOpen, setModalOpen] = useState(false);
  const [detailScore, setDetailScore] = useState<TeamScore | undefined>(
    undefined,
  );

  const updateIndex = (i: number) => {
    if (enableHover) {
      setOverrideIndex(i + 1);
      setHoveredIndex(i + 1);
    }
  };

  const allScores = gameData.slice(1);
  const hasTime = allScores[0]?.time != null;

  useEffect(() => {
    // development tool to test score output with the python scoring script

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
    <>
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
                sx={{ width: hasTime ? "10%" : "15%", paddingLeft: "5px" }}
              >
                Quarter
              </Themed.th>
              {hasTime && <Themed.th sx={{ width: "10%" }}>Time</Themed.th>}
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
              <Themed.th
                sx={{ width: ["20%", "10%", "10%"], textAlign: "right" }}
              >
                Index
              </Themed.th>
              <Themed.th />
            </Themed.tr>
          </thead>
          <tbody>
            {allScores.map((d, i) => {
              const currentTeam = isTeam1 ? d.team1 : d.team2;
              const score = currentTeam.miseryIndex;
              let nextScore = score;
              if (i < allScores.length - 1) {
                nextScore = (
                  isTeam1 ? allScores[i + 1].team1 : allScores[i + 1].team2
                ).miseryIndex;
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
                      sx={{
                        paddingLeft: "5px",
                        whiteSpace: "pre",
                        ...defaultSx,
                      }}
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
                  <Themed.td
                    sx={{
                      color: getIsPositive(score, nextScore)
                        ? "highlightPositive"
                        : "highlightNegative",
                      textAlign: "right",
                      ...defaultSx,
                    }}
                  >
                    {score.toFixed(2)}
                  </Themed.td>
                  <Themed.td
                    sx={{
                      padding: 0,
                      paddingRight: 1,
                      paddingLeft: 1,
                      ...defaultSx,
                    }}
                  >
                    <Button
                      variant="secondary"
                      sx={{ padding: "2px 4px", lineHeight: "normal" }}
                      onClick={() => {
                        setModalOpen(true);
                        setDetailScore(currentTeam);
                      }}
                    >
                      <MdOpenInNew style={{ marginTop: "2px" }} />
                    </Button>
                  </Themed.td>
                </Themed.tr>
              );
            })}
          </tbody>
        </Themed.table>
      </Card>
      <ScoreDetails
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        teamScore={detailScore}
      />
    </>
  );
};
