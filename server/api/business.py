import requests
from sqlalchemy import exc, func

from database import db
from database.models import Puzzle

headers = {
    'Origin': 'https://cutcaptcha.com',
    'Referer': 'https://cutcaptcha.com/captcha/SAs61IAI.html',
    'User-Agent': 'Mozilla/5.0',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json; charset=UTF-8'
}

payload = {
    'f': "",
    'i': "4256A7a1XEiEL72IUdPL97ei7EuEEAuu",
    'ip': 0,
    'papi': "ObSji8QE5hJIU947p50ySuF3isUIO4KswlERKBm/oLgbFujikI1G0dg04SJWCcs5f73VHChCnS+DbMuG5fudZUVBiQkDLq8vb3L/dHY8QacOSQSr6raGu8CaiQvBxwithYvYDiqUwiL+e2CeC5EF85kb4upaLJXTuJ8kUm/tZeZSQIoaeHelLjk4QNXhtt/WRS/0agKvytpoehx444gMz3R9EUhXbUk+PNrsazYDqmlIShMDq+6M+xBarz2PMtL5f8Vv7YYvuvoNPOizPtmmKht9ST+AVEJe/kY5B0GC7b+QEX3VFgR5vpGBQHt9ohw4SyCVAkX4I56wt2NdcaeO/7PjkZNtZrqO4hhs6SYZjc7pa2mj786V7A==",
}

def request_puzzle():

    print('Requesting a new puzzle...')

    try:
        resp = requests.post('https://cutcaptcha.com/captcha/SAs61IAI.json', headers=headers, json=dict(api_key='SAs61IAI'), timeout=7)
    except requests.exceptions.ReadTimeout as timeout_err:
        print(f'Timeout: {timeout_err}')
        return None

    try:
        ret = resp.json()
    except ValueError:
        print('Most likely server is down')
        return None

    if ret.get('succ', False):
        return dict(question=ret['captcha_question'], token=ret['captcha_token'])
    else:
        return None

def get_puzzle():

    while True:
        ret = request_puzzle()

        if not ret:
            return dict(OK=False, result='Cutcaptcha Server Error')

        try:
            result = Puzzle.query.filter(Puzzle.question == ret['question']).all()
        except exc.SQLAlchemyError as sae:
            print(f'SQL Error: {sae}')
            return dict(OK=False, result='SQL Error')

        if not len(result):
            print(f'No puzzle found for question ID = {ret["question"]}')
            return dict(OK=False, result='Database Error')

        if len(result) > 1:
            print(f'Found more than one puzzle for question ID = {ret["question"]}')
            return dict(OK=False, result='Database Error')

        if result[0].typ == 'unknown':
            return dict(OK=True, result=ret)
        else:
            print(f'Question {ret["question"]} is {result[0].typ}')

def submit_puzzle(data):

        token = data['token']
        question = data['guid']
        x0,y0,x1,y1,x2,y2 = data['coords']

        if len(token) != 32:
            return dict(OK=False, result='Wrong token')    
        if len(question) != 36:
            return dict(OK=False, result='Wrong question')

        payload['captcha_token'] = token
        payload['solution'] = [[x0, y0, 0], [x1, y1, 0], [x2, y2, 0]]

        print('Checking solution...')
        try:
            resp = requests.post('https://cutcaptcha.com/captcha/SAs61IAI/check', headers=headers, json=payload, timeout=7)
        except requests.exceptions.ReadTimeout as timeout_err:
            print(f'Timeout: {timeout_err}')
            return dict(OK=False, result='Server timed out')

        try:
            ret = resp.json()
        except ValueError:
            print('Most likely server is down')
            return dict(OK=False, result='Server is down')

        successful = ret.get('succ', False)
        solved = ret.get('correct', False)

        if successful and solved:
            print('Nice!')

            updated_vals = dict(typ='solved', token=token, x0=x0, x1=x1, x2=x2, y1=y1, y0=y0, y2=y2)

            try:
                rows_matched = Puzzle.query.filter_by(question=question).update(updated_vals)
                db.session.commit()
            except exc.SQLAlchemyError as sae:
                print(f'SQL Error: {sae}')
                return dict(OK=False, result='SQL Error')

            return dict(OK=True, rows=rows_matched)
        else:
            print('Incorrect')
            return dict(OK=True, result='Not correct')

def update_puzzle(data):

    question = data['guid']
    puzzle_type = data['type']

    if len(question) != 36:
        return dict(OK=False, result='Wrong question')

    print(f'Marking {question} as {puzzle_type}!')

    try:
        rows_matched = Puzzle.query.filter_by(question=question).update(dict(typ=puzzle_type))
        db.session.commit()
    except exc.SQLAlchemyError as sae:
        print(f'SQL Error: {sae}')
        return dict(OK=False, result='SQL Error')

    return dict(OK=True, result='Recieved', rows=rows_matched)

def get_stats():
    try:
        # SELECT typ, COUNT(typ) FROM puzzle GROUP BY typ 
        r = db.session.query(Puzzle.typ, func.count(Puzzle.typ)).group_by(Puzzle.typ).all()
    except exc.SQLAlchemyError as sae:
        print(f'SQL Error: {sae}')
        return dict(OK=False, result='SQL Error')

    if r is not None:
        return dict(OK=True, result={ typ[0]: typ[1] for typ in r })
    else:
        return dict(OK=False, result='SQL Error')  
