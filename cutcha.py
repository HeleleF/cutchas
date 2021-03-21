#!/usr/bin/env python3
import asyncio
import logging
import os
import sqlite3
import time
from sys import version_info, platform

from aiohttp import (ClientConnectionError, ClientError, ClientSession,
                     ContentTypeError)

assert version_info >= (3, 7), 'Install Python 3.7 or higher'

# asyncio bug in python 3.8+ on windows (see https://bugs.python.org/issue39232)
# workaround from https://github.com/encode/httpx/issues/914#issuecomment-622586610
if version_info >= (3, 8) and platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

log = logging.getLogger('cutcha')
log.setLevel(logging.DEBUG)

fh = logging.FileHandler('./cutcha.log', 'w', 'utf-8')
ch = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s', '%Y-%m-%d %H:%M:%S')
fh.setFormatter(formatter)
ch.setFormatter(formatter)

log.addHandler(fh)
log.addHandler(ch)

def insert_db(q_list: list, puzzle_type: str, db_path: str = './server/cutcha.db'):

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    try:

        cur.executemany("INSERT INTO puzzle (question,typ) values (?,?)", [(q, puzzle_type) for q in q_list])
        conn.commit()
    except sqlite3.IntegrityError as sie:
        log.error(f'Inserting for type {puzzle_type} failed with {sie}')

    cur.close()
    conn.close()


def read_db(puzzle_type: str, db_path: str = './server/cutcha.db'):

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("SELECT question FROM puzzle WHERE typ=?", (puzzle_type, ))
    qids = [qid[0] for qid in cur.fetchall()]

    cur.close()
    conn.close()

    return qids


def load_questions(num_tasks: int = 100, num_reqs: int = 100):

    payload = dict(api_key='SAs61IAI', i='4256A7a1XEiEL72IUdPL97ei7EuEEAuu', ts=1588073977)

    headers = {
        'Origin': 'https://cutcaptcha.com',
        'Referer': 'https://cutcaptcha.com/captcha/SAs61IAI.html',
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }

    results = dict(existing=0, duplicate=0, broken=0)

    existing_qids = os.listdir('./train')
    loaded_qids = []

    failed_qids = read_db('broken')

    log.info(f'Starting {num_tasks} tasks with {num_reqs} requests each => Performing {num_tasks * num_reqs} requests in total!')

    async def produce(sess: ClientSession, queue: asyncio.Queue, cnt: int):

        attempts = 0

        for _ in range(cnt):
            try:
                async with sess.post('https://cutcaptcha.com/captcha/SAs61IAI.json', data=payload) as response:

                    try:
                        content = await response.json()
                        qid = content.get('captcha_question', None)

                        if qid:
                            await queue.put(qid)
                        else:
                            log.warning(f'Recieved JSON without question: {content}')
                        
                    except ContentTypeError as cte:

                        attempts += 1

                        if attempts > 2:
                            log.error('Canceling producer...')
                            break

                        txt = await response.text()
                        log.warning(f'Attempt #{attempts}: Recieved non-JSON: {txt}\nError: {cte}')

            except ClientConnectionError as ce:
                log.error(f'Failed with {ce}')
                break

    async def consume(queue: asyncio.Queue):
        while True:
            qid = await queue.get()

            if qid in existing_qids:
                results['existing'] += 1
            elif qid in failed_qids:
                results['broken'] += 1
            elif qid in loaded_qids:
                results['duplicate'] += 1
            else:
                loaded_qids.append(qid)

            queue.task_done()

    async def produce_and_consume():

        queue = asyncio.Queue()

        consumer = asyncio.create_task(consume(queue))
    
        #conn = TCPConnector(ssl=False)

        # conn = ProxyConnector(
        #     proxy_type=ProxyType.HTTPS,
        #     host='51.158.99.51',
        #     port=8761,
        # )
        async with ClientSession(headers=headers) as sess:
            producers = [asyncio.create_task(produce(sess, queue, num_reqs)) for _ in range(num_tasks)]
        
            log.info('Waiting for producers...')
            await asyncio.gather(*producers)

        log.info('Waiting for queue processing...')
        await queue.join()

        log.info('Canceling consumer')
        consumer.cancel()

    start = time.perf_counter()
    asyncio.run(produce_and_consume())
    elapsed = time.perf_counter() - start

    log.info(f'Recieved {len(loaded_qids)} new questions in {elapsed:.2f} seconds')
    log.info(f'ALREADY EXISTED: {results["existing"]}')
    log.info(f'DUPLICATES DURING THIS RUN: {results["duplicate"]}')
    log.info(f'KNOWN TO BE BROKEN: {results["broken"]}')

    return load_images(loaded_qids)


def load_images(questions: list):

    if not len(questions):
        log.info('nothing to do')
        return

    failed = []
    success = []

    async def fetch_imgs(session: ClientSession, qid: str):

        cut = part0 = part1 = part2 = None

        try:
            async with session.get(f'https://cutcaptcha.com/captcha/SAs61IAI/{qid}/cut.png') as response:

                content = await response.read()
                if len(content) > 50:
                    cut = content

                    
            async with session.get(f'https://cutcaptcha.com/captcha/SAs61IAI/{qid}/part0.png') as response:

                content = await response.read()
                if len(content) > 50:
                    part0 = content


            async with session.get(f'https://cutcaptcha.com/captcha/SAs61IAI/{qid}/part1.png') as response:

                content = await response.read()
                if len(content) > 50:
                    part1 = content


            async with session.get(f'https://cutcaptcha.com/captcha/SAs61IAI/{qid}/part2.png') as response:

                content = await response.read()
                if len(content) > 50:
                    part2 = content

        except ClientError as e:
            log.error(f'{qid} got error: {e}')

        if cut and part0 and part1 and part2:

            os.makedirs(f'./train/{qid}')

            with open(f'./train/{qid}/cut.png', 'wb') as fd:
                fd.write(cut)
            with open(f'./train/{qid}/part0.png', 'wb') as fd:
                fd.write(part0)
            with open(f'./train/{qid}/part1.png', 'wb') as fd:
                fd.write(part1)
            with open(f'./train/{qid}/part2.png', 'wb') as fd:
                fd.write(part2)

            success.append(qid)

        else:
            failed.append(qid)

    async def fetch_all(qids):

        # conn = ProxyConnector(
        #     proxy_type=ProxyType.HTTPS,
        #     host='51.158.99.51',
        #     port=8761,
        # )
        async with ClientSession() as sess:

            tasks = [asyncio.create_task(fetch_imgs(sess, qid.strip())) for qid in qids]

            log.info(f'Fetching {len(qids)} puzzles...')
            result = await asyncio.gather(*tasks)

            log.info(f'Fetched {len(success)} puzzles successfully!')
            log.info(f'Failed to fetch {len(failed)} puzzles!')

    start = time.perf_counter()
    asyncio.run(fetch_all(questions))
    elapsed = time.perf_counter() - start

    insert_db(success, 'unknown')
    insert_db(failed, 'broken')

    log.info(f'Done after {elapsed:.2f} seconds')

load_questions(50, 50)
