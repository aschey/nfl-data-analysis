import json
import sqlite3


def sql_result_values(dictList): return [list(d.values())[0] for d in dictList]


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
