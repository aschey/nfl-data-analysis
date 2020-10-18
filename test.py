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
        {'team1': 7, 'team2': 30, 'q': 4}
    ]
]


def f(x, q, m):
    s = x ** 2 / (5 - q) if x > 0 else -((-x + (10 * q)) ** 2 + 10)/100
    d = -(1 - (x/m if m != 0 else 1)) * (5-q) if x > 0 else (-m + x) * q
    return s + d


for v in vals:
    m = 0
    for val in v:
        x = val['team1'] - val['team2']
        m = max(m, x)
        print(f(x, val['q'], m))
    print()
