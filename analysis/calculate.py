import math
from numpy import diff
from itertools import takewhile


class Scorer:
    def __init__(self):
        self.max_pos_diff = 0
        self.max_neg_diff = 0
        self.max_pos_quarter = 1
        self.current_quarter = 1
        self.prev_score = 0
        self.previous_quarter_diffs = []
        self.current_quarter_diff = 0

    def calculate(self, team1_score, team2_score, quarter, final):
        diff = team1_score - team2_score
        self.max_pos_diff = max(self.max_pos_diff, diff)
        self.max_neg_diff = min(self.max_neg_diff, diff)

        if quarter > self.current_quarter or final:
            self.current_quarter = quarter
            self.previous_quarter_diffs.append(self.current_quarter_diff)
            if final:
                self.previous_quarter_diffs.append(diff)
        self.current_quarter_diff = diff
        new_score = self.f(diff, quarter, self.max_pos_diff, self.max_neg_diff, self.previous_quarter_diffs)
        self.prev_score = new_score
        return new_score

    def sigmoid(self, x, max_val, growth):
        dividend = 1 + math.e ** (-growth * (x - math.log(max_val) / growth))
        return (max_val + 1) / dividend - 1

    def g(self, all_diffs, quarter, negative):
        # get slope of all score diffs (negative slope means decreasing margin and vice versa)
        derivative = diff(all_diffs)
        if len(derivative) == 0:
            return 0

        filter = (lambda v: v < 0) if negative else (lambda v: v > 0)
        # get last run of increasing or decreasing margin
        run = list(takewhile(filter, derivative[::-1]))[::-1]
        # take square root of squared margins, this increases weight of points scored in a single quarter
        # also weight later quarters higher
        avg = math.sqrt(sum((v * (i + 1)) ** 2 for i,
                            v in enumerate(run))) / max(len(run), 1)
        ret = (avg * (quarter / max(quarter, 4))) ** 1.5
        return -ret if negative else ret

    def f(self, score_diff, quarter, max_pos_diff, max_neg_diff, all_diffs):
        if score_diff > 0 or (score_diff == 0 and self.prev_score < 0):
            # current lead
            s = self.sigmoid(score_diff, 50, 0.3 + (0.03 * quarter))
            # current lead relative to max lead
            d1 = self.sigmoid(score_diff / max(max_pos_diff, 1),
                              10 * quarter, 10 * quarter)
            # maximum deficit overcome
            d2 = (score_diff - max_neg_diff) + \
                self.g(all_diffs, quarter, False)
        elif score_diff < 0 or (score_diff == 0 and self.prev_score > 0):
            # current defecit
            s = -self.sigmoid(-score_diff, 50, 0.3 + (0.03 * quarter))
            # current deficit relative to max deficit
            d1 = -self.sigmoid(score_diff / min(max_neg_diff, -1),
                               10 * quarter, 10 * quarter)
            # total deficit from previous max lead
            d2 = score_diff - max_pos_diff + self.g(all_diffs, quarter, True)
        #print(s, d1, d2)
        return s + d1 + d2
