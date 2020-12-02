import math
from numpy import diff
from itertools import takewhile

# vals = [
#     [
#         {'team1': 17, 'team2': 3, 'q': 1},
#         {'team1': 24, 'team2': 3, 'q': 2},
#         {'team1': 24, 'team2': 6, 'q': 3},
#         {'team1': 24, 'team2': 30, 'q': 4}
#     ],
#     [
#         {'team1': 17, 'team2': 3, 'q': 1},  # 14
#         {'team1': 24, 'team2': 3, 'q': 2},  # 21 6
#         {'team1': 24, 'team2': 9, 'q': 3},  # 15 -6
#         {'team1': 24, 'team2': 30, 'q': 4}  # -6 -21
#     ],
#     [
#         {'team1': 10, 'team2': 17, 'q': 1},
#         {'team1': 21, 'team2': 24, 'q': 2},
#         {'team1': 24, 'team2': 30, 'q': 3},
#         {'team1': 24, 'team2': 30, 'q': 4}
#     ],
#     [
#         {'team1': 0, 'team2': 6, 'q': 1},
#         {'team1': 7, 'team2': 14, 'q': 2},
#         {'team1': 7, 'team2': 21, 'q': 3},
#         {'team1': 7, 'team2': 30, 'q': 4}
#     ],
#     [
#         {'team1': 0, 'team2': 6, 'q': 1},
#         {'team1': 7, 'team2': 14, 'q': 2},
#         {'team1': 7, 'team2': 21, 'q': 3},
#         {'team1': 31, 'team2': 30, 'q': 4}
#     ],
#     [
#         {'team1': 3, 'team2': 17, 'q': 1},  # -14
#         {'team1': 3, 'team2': 21, 'q': 2},  # -18 -4
#         {'team1': 7, 'team2': 21, 'q': 3},  # -14 4
#         {'team1': 31, 'team2': 30, 'q': 4}  # 1 15
#     ],
#     [
#         {'team1': 3, 'team2': 17, 'q': 1},  # -14
#         {'team1': 3, 'team2': 17, 'q': 2},  # -14 0
#         {'team1': 7, 'team2': 21, 'q': 3},  # -14 0
#         {'team1': 31, 'team2': 30, 'q': 4}  # 1 15
#     ],
#     [
#         {'team1': 7, 'team2': 6, 'q': 1},
#         {'team1': 21, 'team2': 14, 'q': 2},
#         {'team1': 24, 'team2': 21, 'q': 3},
#         {'team1': 31, 'team2': 30, 'q': 4}
#     ],
#     [
#         {'team1': 7, 'team2': 6, 'q': 1},
#         {'team1': 21, 'team2': 6, 'q': 2},
#         {'team1': 24, 'team2': 6, 'q': 3},
#         {'team1': 31, 'team2': 14, 'q': 4}
#     ]

# ]


class Scorer:
    def __init__(self):
        self.max_pos_diff = 0
        self.max_neg_diff = 0
        self.max_pos_quarter = 1
        self.current_quarter = 1
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
        return self.f(diff, quarter, self.max_pos_diff, self.max_neg_diff, self.previous_quarter_diffs)

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
        if score_diff >= 0:
            # current lead
            s = self.sigmoid(score_diff, 50, 0.3 + (0.03 * quarter))
            # current lead relative to max lead
            d1 = self.sigmoid(score_diff/max(max_pos_diff, 1),
                              10 * quarter, 10 * quarter)
            # maximum deficit overcome
            d2 = (score_diff - max_neg_diff) + \
                self.g(all_diffs, quarter, False)
        else:
            # current defecit
            s = -self.sigmoid(-score_diff, 50, 0.3 + (0.03 * quarter))
            # current deficit relative to max deficit
            d1 = -self.sigmoid(score_diff/max_neg_diff,
                               10 * quarter, 10 * quarter)
            # total deficit from previous max lead
            d2 = score_diff - max_pos_diff + self.g(all_diffs, quarter, True)
        #print(s, d1, d2)
        return s + d1 + d2


#s = Scorer()
#print(s.calculate(0, 7, 1, False))
# for i, v in enumerate(vals):
#     mp = 0
#     mn = 0
#     mpq = 1
#     current_q = 1
#     prev_q_diffs = []
#     current_q_diff = 0
#     print(i)
#     for j, val in enumerate(v):
#         x = val['team1'] - val['team2']
#         mp = max(mp, x)
#         mn = min(mn, x)

#         if val['q'] > current_q or j == len(v) - 1:
#             current_q = val['q']

#             prev_q_diffs.append(current_q_diff)
#             if j == len(v) - 1:
#                 prev_q_diffs.append(x)
#             prev_q_diff = current_q_diff
#         current_q_diff = x
#         if val['q'] == 4:
#             pass

#         print(f(x, val['q'], mp, mn, prev_q_diffs))
#     print()
