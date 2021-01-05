from flask import Flask, request
from flask_cors import CORS
import json
from typing import Tuple, Union
from helpers import get_connection, sql_result_values, \
    get_team_structure, try_get_param

app = Flask(__name__)
CORS(app)


@app.route('/years')
def get_years() -> str:
    c = get_connection()
    db_response = c.execute(
        '''select distinct year from week order by year desc''').fetchall()
    result = sql_result_values(db_response)
    return json.dumps(result)


@app.route('/weeks')
def get_weeks() -> Union[str, Tuple[str, int]]:
    year, error = try_get_param('year', int)
    if year == None:
        return error, 400

    c = get_connection()
    result = c.execute(
        '''select week_id, week_name from week where year = ? order by week_order''', (year,)).fetchall()

    return json.dumps(result)


@app.route('/games')
def get_games() -> Union[str, Tuple[str, int]]:
    week_id, error = try_get_param('weekId', int)
    if week_id == None:
        return error, 400

    c = get_connection()
    result = c.execute('''
    select
        t1.original_city team1_original_city, 
        t1.original_mascot team1_original_mascot, 
        t1.city team1_city, 
        t1.mascot team1_mascot, 
        t1.team_id team1_id,
        t2.original_city team2_original_city, 
        t2.original_mascot team2_original_mascot,
        t2.city team2_city,
        t2.mascot team2_mascot,
        t2.team_id team2_id,
        g.game_id
    from game g
    inner join team t1 on t1.team_id = g.team1_id
    inner join team t2 on t2.team_id = g.team2_id
    where g.week_id = ?
    ''', (week_id,)).fetchall()

    fields = ['originalCity', 'originalMascot', 'city', 'mascot', 'id']
    response = get_team_structure(result, fields)
    return json.dumps(response)


@app.route('/scores')
def get_scores() -> Union[str, Tuple[str, int]]:
    week_id, error = try_get_param('weekId', int)
    if week_id == None:
        return error, 400

    c = get_connection()
    result = c.execute('''
    select 
        g.game_id,
        s.quarter,
        s.time,
        s.scoring_team_id,
        s.detail, 
        s.team1_game_score,
        s.team2_game_score, 
        round(s.team1_misery_index, 2) team1_misery_index, 
        round(s.team2_misery_index, 2) team2_misery_index,
        s.score_order
    from score s
	inner join game g on g.game_id = s.game_id
    where g.week_id = ?
    ''', (week_id,)).fetchall()

    fields = ['gameScore', 'miseryIndex']
    response = get_team_structure(result, fields)

    return json.dumps(response)
