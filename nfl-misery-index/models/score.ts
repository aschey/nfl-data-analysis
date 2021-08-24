import { TeamScore } from "./teamScore";

export interface Score {
  gameId: number;
  quarter: number;
  time: string;
  scoringTeamId: number;
  detail: string;
  scoreOrder: number;
  isLastOfQuarter: boolean;
  team1: TeamScore;
  team2: TeamScore;
}
