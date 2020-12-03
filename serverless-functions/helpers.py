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


def _get_team(team_key, result, fields):
    return {field: result[f'{team_key}{field[0].upper()}{field[1:]}']
            for field in fields}


def _get_non_team(result):
    return {field: result[field] for field in result if not field.startswith('team')}


def get_team_structure(result, fields):
    response = [{
        **_get_non_team(r),
        'team1': _get_team('team1', r, fields),
        'team2': _get_team('team2', r, fields)
    } for r in result]

    return response
