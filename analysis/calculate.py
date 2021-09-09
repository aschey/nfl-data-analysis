import math
from typing import List, Union
from numpy import diff, stack

MINS_IN_QUARTER = 15.0
TOTAL_MINS = 60.0
MAX_LEAD_POINTS = 60.0
show_output = False


class Scorer:
    def __init__(self):
        self.max_pos_diff: float = 0
        self.max_neg_diff: float = 0
        self.current_index: int = 0
        self.max_pos_index: int = 0
        self.max_neg_index: int = 0
        self.max_pos_quarter: int = 1
        self.current_quarter: int = 1
        self.prev_score: float = 0
        self.all_diffs: List[float] = []
        self.diff_times: List[float] = []
        self.current_quarter_diff: float = 0

    def calculate(
        self,
        team1_score: int,
        team2_score: int,
        quarter: int,
        quarter_time_remaining: Union[str, None],
    ):
        # Default to halfway through the quarter if time is not known
        if quarter_time_remaining is None:
            quarter_time_remaining = "7:50"

        minutes, seconds = quarter_time_remaining.split(":")
        quarter_mins = MINS_IN_QUARTER - (
            float(minutes) + (float(seconds) / TOTAL_MINS)
        )

        # If score happened at 15:00 in the first quarter we get 0 for total time
        # Default to 0.01 in this case to prevent division by zero errors
        total_time = max((quarter - 1) * MINS_IN_QUARTER + quarter_mins, 0.01)

        if show_output:
            print(team1_score, team2_score, total_time)

        current_diff = team1_score - team2_score

        if current_diff > self.max_pos_diff:
            self.max_pos_diff = current_diff
            self.max_pos_index = self.current_index
        if current_diff < self.max_neg_diff:
            self.max_neg_diff = current_diff
            self.max_neg_index = self.current_index

        self.diff_times.append(total_time)

        new_score = self._calculate_score(
            current_diff,
            total_time,
        )
        self.prev_score = new_score
        self.current_index += 1
        return new_score

    def _sigmoid(self, x: float, max_val: float, growth: float) -> float:
        if max_val == 0.0:
            return 0.0
        dividend = 1 + math.e ** (-growth * (x - math.log(max_val) / growth))
        return (max_val + 1) / dividend - 1

    def _square(self, val: float):
        return -(val ** 2) if val < 0 else val ** 2

    def _sqrt(self, val: float):
        return -math.sqrt(abs(val)) if val < 0 else math.sqrt(val)

    def _weighted_run(self, total_time: float, start_index: int) -> float:
        # get slope of all score diffs (negative slope means decreasing margin and vice versa)
        deriv_scores, deriv_times = diff((self.all_diffs, self.diff_times))
        if len(deriv_scores) == 0:
            return 0

        deriv = stack((deriv_scores, deriv_times, self.diff_times[1:]), axis=1)

        # get last run since max or min score diff
        run = deriv[start_index:]
        # take square root of squared margins, this increases weight of points scored in a single quarter
        # also weight later quarters higher
        avg = self._sqrt(
            sum(
                self._square(
                    val
                    * ((TOTAL_MINS - time_diff) / TOTAL_MINS)
                    * (time / MINS_IN_QUARTER)
                )
                for val, time_diff, time in run
            )
        ) / max(len(run), 1)
        ret = avg * (total_time / max(total_time, TOTAL_MINS))
        return ret

    def _calculate_score(self, score_diff: float, total_time: float) -> float:
        if score_diff > 0 or (score_diff == 0 and self.prev_score < 0):
            multiplier = 1
            deficit_diff = -1 * self.max_neg_diff
            score_index = self.max_neg_index
        else:
            multiplier = -1
            deficit_diff = -1 * self.max_pos_diff
            score_index = self.max_pos_index

        # Lead at this point where you aren't worried about losing
        comfortable_lead = max(
            math.sqrt(
                MAX_LEAD_POINTS * (1 - min(total_time, TOTAL_MINS) + (TOTAL_MINS - 1))
            ),
            1,
        )
        score_diff_normalized = multiplier * self._sigmoid(
            abs(score_diff), MAX_LEAD_POINTS, 10 / comfortable_lead
        )

        self.all_diffs.append(score_diff_normalized)

        # maximum deficit overcome (if winning) or total deficit from previous max lead (if losing)
        run = self._weighted_run(total_time, score_index)
        max_deficit = deficit_diff + run

        score = score_diff_normalized + max_deficit
        if show_output:
            print(
                score_diff,
                score_diff_normalized,
                comfortable_lead,
                max_deficit,
                deficit_diff,
                run,
                score,
            )
            print()

        return score


if show_output:
    s = Scorer()
