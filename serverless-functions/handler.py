import codecs
from contextlib import closing
import csv
# mport requests
import json
import sqlite3
#import pandas as pd


def hello(event, context):
    if 'source' in event and event['source'] == 'serverless-plugin-warmup':
        print('warmup')
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'function is warm'})
        }
    url = './scores_with_index.csv'
    rows = None
    conn = sqlite3.connect('test.db')
    c = conn.cursor()
    #c.execute('''CREATE TABLE scores (detail text, quarter int, date date, score1 float, score2 float, team1 text, team2 text, team1Score number, team2Score number, week text, year int, matchup text, scoringTeam text)''')
    #scores = pd.read_csv(url)
    res = c.execute(
        '''select * from score where game_id = 3''').fetchall()
    #scores.to_sql('scores2', conn, index=False)
    # with open(url, 'r') as r:
    #     # with closing(requests.get(url, stream=True)) as r:
    #     reader = csv.DictReader(r)
    #     # next(reader)
    #     rows = [r for r in reader if r['week'] == '1999 Week 7']

    body = {
        "message": "Go Serverless v1.0! Your function executed successfully!",
        "input": res[0]
    }

    response = {
        "statusCode": 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
        },
        "body": json.dumps(body)
    }

    return response
