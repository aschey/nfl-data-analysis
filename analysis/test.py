vals = [
    [
        {'team1': 17, 'team2': 3, 'q': 1},
        {'team1': 24, 'team2': 3, 'q': 2},
        {'team1': 24, 'team2': 6, 'q': 3},
        {'team1': 24, 'team2': 30, 'q': 4}
    ],
    [
        {'team1': 10, 'team2': 17, 'q': 1},
        {'team1': 21, 'team2': 24, 'q': 2},
        {'team1': 24, 'team2': 30, 'q': 3},
        {'team1': 24, 'team2': 30, 'q': 4}
    ],
    [
        {'team1': 0, 'team2': 6, 'q': 1},
        {'team1': 7, 'team2': 14, 'q': 2},
        {'team1': 7, 'team2': 21, 'q': 3},
        {'team1': 7, 'team2': 30, 'q': 4}
    ],
    [
        {'team1': 0, 'team2': 6, 'q': 1},
        {'team1': 7, 'team2': 14, 'q': 2},
        {'team1': 7, 'team2': 21, 'q': 3},
        {'team1': 31, 'team2': 30, 'q': 4}
    ]
]


def f(score_diff, quarter, max_pos_diff, max_neg_diff):
    if score_diff > 0:
        s = score_diff ** (11/10) / (5 - quarter)
        d1 = -(1 - (score_diff/max_pos_diff if max_pos_diff != 0 else 1)) * (5-quarter)
        d2 = (-max_neg_diff + score_diff) ** 2 / (5 - quarter)
    else:
        s = - ((-score_diff + (10 * quarter)) ** (11/10) + 10)/100
        d1 = (-max_pos_diff + score_diff) * quarter
        d2 = -(score_diff/max_neg_diff if max_neg_diff != 0 else 1) * (5-quarter)
    #print(s, d1, d2)
    return s + d1 + d2


for v in vals:
    mp = 0
    mn = 0
    for val in v:
        x = val['team1'] - val['team2']
        mp = max(mp, x)
        mn = min(mn, x)
        print(f(x, val['q'], mp, mn))
    print()
