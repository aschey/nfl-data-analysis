import { flatMap, flow, map } from "lodash/fp";
import { Game } from "../models/game";
import { GameTeam } from "../models/gameTeam";
import { Score } from "../models/score";
import { Value } from "../models/value";
import { Week } from "../models/week";
import { getJson } from "./fetchUtil";

export const getMatchups = async (
  weekId: number,
  apiUrl: string = undefined,
): Promise<Value<GameTeam>[]> => {
  const games = await getJson<Game[]>(`/games?weekId=${weekId}`, apiUrl);

  const matchups: Value<GameTeam>[] = flow(
    map((g: Game) => [
      {
        label: `${g.team1.originalMascot} (vs ${g.team2.originalMascot})`,
        value: { team: g.team1, game: g },
      },
      {
        label: `${g.team2.originalMascot} (vs ${g.team1.originalMascot})`,
        value: { team: g.team2, game: g },
      },
    ]),
    flatMap((g: Value<GameTeam>[]) => g),
  )(games);

  return matchups;
};

export const getWeeks = async (
  year: number,
  apiUrl: string = undefined,
): Promise<Value<number>[]> => {
  const weeks = await getJson<Week[]>(`/weeks?year=${year}`, apiUrl);
  const weekValues = weeks.map<Value<number>>((w) => ({
    label: w.weekName,
    value: w.weekId,
  }));

  return weekValues;
};

export const getScores = (
  weekId: number,
  apiUrl: string = undefined,
): Promise<Score[]> => getJson<Score[]>(`/scores?weekId=${weekId}`, apiUrl);
