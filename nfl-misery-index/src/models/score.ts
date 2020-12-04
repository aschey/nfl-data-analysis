import { TeamScore } from './teamScore';

export interface Score {
  quarter: number;
  time: string;
  scoringTeamId: number;
  detail: string;
  scoreOrder: number;
  team1: TeamScore;
  team2: TeamScore;
}
