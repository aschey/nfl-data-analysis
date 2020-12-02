from helpers import is_warmup, get_connection, get_response, sql_result_values


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
