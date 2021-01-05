import json
import sqlite3
from sqlite3 import Cursor
from flask import request
from typing import Dict, List, Tuple, Any, Union, Type, Generic, TypeVar, Optional, cast

T = TypeVar('T', str, int)


def sql_result_values(dictList: List[Dict]) -> List:
    return [list(d.values())[0] for d in dictList]


def camel(snake_str: str) -> str:
    first, *others = snake_str.split('_')
    return ''.join([first.lower(), *map(str.title, others)])


def get_connection() -> Cursor:
    def dict_factory(cursor: Cursor, row: List[str]) -> Dict[str, str]:
        d = {camel(col[0]): row[idx]
             for idx, col in enumerate(cursor.description)}
        return d

    conn = sqlite3.connect('scores.db')
    conn.row_factory = dict_factory
    return conn.cursor()


def _get_team(team_key: str, result: Dict[str, str], fields: List[str]) -> Dict[str, str]:
    return {field: result[f'{team_key}{field[0].upper()}{field[1:]}']
            for field in fields}


def _get_non_team(result: Dict[str, str]) -> Dict[str, Any]:
    return {field: result[field] for field in result if not field.startswith('team')}


def get_team_structure(result: List[Dict[str, str]], fields: List[str]) -> List[Dict[str, Dict[str, str]]]:
    response = [{
        **_get_non_team(r),
        'team1': _get_team('team1', r, fields),
        'team2': _get_team('team2', r, fields)
    } for r in result]

    return response


def try_get_param(name: str, arg_type: Type) -> Tuple[Optional[T], str]:
    val: Optional[T] = request.args.get(name, type=arg_type)
    error_response = ''
    if val == None:
        error_response = json.dumps(
            {'message': f'Query parameter "{name}" is required but was not present'})
    return val, error_response
