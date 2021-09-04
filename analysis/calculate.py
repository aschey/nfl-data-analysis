import math
from typing import List, Union
from numpy import diff
from itertools import takewhile

QUARTER_MINS = 15.0


class Scorer:
    def __init__(self):
        self.max_pos_diff: int = 0
        self.max_neg_diff: int = 0
        self.max_pos_quarter: int = 1
        self.current_quarter: int = 1
        self.prev_score: float = 0
        self.previous_quarter_diffs: List[int] = []
        self.current_quarter_diff: int = 0

    def calculate(
        self,
        team1_score: int,
        team2_score: int,
        quarter: int,
        quarter_time_remaining: Union[str, None],
        final: bool,
    ):
        diff = team1_score - team2_score
        self.max_pos_diff = max(self.max_pos_diff, diff)
        self.max_neg_diff = min(self.max_neg_diff, diff)

        # Default to halfway through the quarter if time is not known
        if quarter_time_remaining is None:
            quarter_time_remaining = "7:50"

        minutes, seconds = quarter_time_remaining.split(":")
        quarter_mins = QUARTER_MINS - (float(minutes) + float(seconds) / 60)

        # If score happened at 15:00 in the first quarter we get 0 for total time
        # Default to 0.01 in this case to prevent division by zero errors
        total_time = max((quarter - 1) * QUARTER_MINS + quarter_mins, 0.01)

        if quarter > self.current_quarter or final:
            self.current_quarter = quarter
            self.previous_quarter_diffs.append(self.current_quarter_diff)
            if final:
                self.previous_quarter_diffs.append(diff)
        self.current_quarter_diff = diff
        new_score = self._calculate_score(
            diff,
            total_time,
            self.max_pos_diff,
            self.max_neg_diff,
            self.previous_quarter_diffs,
        )
        self.prev_score = new_score
        return new_score

    def _sigmoid(self, x: float, max_val: float, growth: float) -> float:
        dividend = 1 + math.e ** (-growth * (x - math.log(max_val) / growth))
        return (max_val + 1) / dividend - 1

    def _weighted_run(
        self, all_diffs: List[int], total_time: float, multiplier: int
    ) -> float:
        # get slope of all score diffs (negative slope means decreasing margin and vice versa)
        derivative = diff(all_diffs)
        if len(derivative) == 0:
            return 0

        # get last run of increasing or decreasing margin
        run = list(takewhile(lambda v: v * multiplier > 0, derivative[::-1]))[::-1]
        # take square root of squared margins, this increases weight of points scored in a single quarter
        # also weight later quarters higher
        avg = math.sqrt(sum((v * (i + 1)) ** 2 for i, v in enumerate(run))) / max(
            len(run), 1
        )
        ret = (avg * (total_time / max(total_time, 60))) ** 1.5
        return multiplier * ret

    def _calculate_score(
        self,
        score_diff: int,
        total_time: float,
        max_pos_diff: int,
        max_neg_diff: int,
        all_diffs: List[int],
    ) -> float:
        if score_diff > 0 or (score_diff == 0 and self.prev_score < 0):
            multiplier = 1
            lead_diff = max_pos_diff
            deficit_diff = max_neg_diff
            extreme_func = max
        else:
            multiplier = -1
            lead_diff = max_neg_diff
            deficit_diff = max_pos_diff
            extreme_func = min

        quarter_time = total_time / QUARTER_MINS
        # current lead or current deficit
        s = multiplier * self._sigmoid(
            multiplier * score_diff, 50, 0.3 + (0.03 * quarter_time)
        )
        # current lead relative to max lead or current deficit relative to max deficit
        d1 = multiplier * self._sigmoid(
            score_diff / extreme_func(lead_diff, multiplier),
            10 * quarter_time,
            10 * quarter_time,
        )
        # maximum deficit overcome (if winning) or total deficit from previous max lead (if losing)
        run = self._weighted_run(all_diffs, total_time, multiplier)
        d2 = score_diff - deficit_diff + run

        return s + d1 + d2
