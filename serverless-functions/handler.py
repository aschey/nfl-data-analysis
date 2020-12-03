from helpers import is_warmup, get_connection, get_response, sql_result_values, get_team_structure


def get_years(event, context):
    if is_warmup(event):
        return get_response({'message': 'warmup invocation'})

    c = get_connection()
    db_response = c.execute(
        '''select distinct year from week order by year desc''').fetchall()
    result = sql_result_values(db_response)
    return get_response(result)


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


def get_games(event, context):
    if is_warmup(event):
        return get_response({'message': 'warmup invocation'})
    try:
        week_id = event['queryStringParameters']['weekId']
    except (KeyError, TypeError):
        return get_response({'message': 'Query parameter "weekId" is required but was not present'}, 400)

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
    return get_response(response)


def get_scores(event, context):
    if is_warmup(event):
        return get_response({'message': 'warmup invocation'})
    try:
        game_id = event['queryStringParameters']['gameId']
    except (KeyError, TypeError):
        return get_response({'message': 'Query parameter "gameId" is required but was not present'}, 400)

    c = get_connection()
    result = c.execute('''
    select 
    quarter, time, scoring_team_id, detail, 
    team1_game_score, team2_game_score, 
    round(team1_misery_index, 2) team1_misery_index, 
    round(team2_misery_index, 2) team2_misery_index
    from score s
    where s.game_id = ?
    ''', (game_id,)).fetchall()

    fields = ['gameScore', 'miseryIndex']
    response = get_team_structure(result, fields)

    return get_response(response)
