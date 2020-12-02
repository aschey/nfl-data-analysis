import codecs
from contextlib import closing
import csv
# mport requests
import json
import sqlite3
#import pandas as pd


def flatten(t): return [item for sublist in t for item in sublist]


def is_warmup(
    event): return 'source' in event and event['source'] == 'serverless-plugin-warmup'


def get_response(body, status_code=200):
    return {
        "statusCode": status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
        },
        'body': json.dumps(body)
    }


def camel(snake_str):
    first, *others = snake_str.split('_')
    return ''.join([first.lower(), *map(str.title, others)])


def get_connection():
    def dict_factory(cursor, row):
        d = {camel(col[0]): row[idx]
             for idx, col in enumerate(cursor.description)}
        return d

    conn = sqlite3.connect('scores.db')
    conn.row_factory = dict_factory
    return conn.cursor()


def get_years(event, context):
    if is_warmup(event):
        return get_response({'message': 'warmup invocation'})

    c = get_connection()
    db_response = c.execute(
        '''select distinct year from week order by year desc''')
    result = flatten(db_response)

    response = get_response(result)
    return response


def get_weeks(event, context):
    if is_warmup(event):
        return get_response({'message': 'warmup invocation'})

    try:
        year = event['queryStringParameters']['year']
    except (KeyError, TypeError):
        return get_response({'message': 'Query parameter "year" is required but was not present'}, 400)

    c = get_connection()
    result = c.execute(
        '''select week_id, week_name from week where year = ? order by week_order''', (year,)).fetchall()

    return get_response(result)
