#!/usr/bin/env python3
import asyncio
import logging
import os
import time
from datetime import datetime
from sys import platform, version_info

import aiohttp
from dotenv import load_dotenv
from pymongo import MongoClient

# asyncio bug in python 3.8+ on windows (see https://bugs.python.org/issue39232)
# workaround from https://github.com/encode/httpx/issues/914#issuecomment-622586610
if version_info >= (3, 8) and platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# backend uses the same env, reuse it
load_dotenv('./backend/.env', verbose=True)


log = logging.getLogger('cutcha')
log.setLevel(logging.DEBUG)

fh = logging.FileHandler('./cutcha.log', 'w', 'utf-8')
ch = logging.StreamHandler()
fh.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
ch.setFormatter(logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s', '%H:%M:%S'))

log.addHandler(fh)
log.addHandler(ch)


client = MongoClient(os.environ['MONGO_DB_URL'])
db = client.cutchaPuzzles


def insert_into_db(q_list: list[str], puzzle_types: list[str]) -> None:
    """
    Inserts new puzzle ids into the database.\n
    For each puzzle id in `q_list` there needs to be a correspoding type
    in `puzzle_types`
    """

    docs = [dict(
        question=qid,
        typ=p_type,
        x0=None,
        y0=None,
        x1=None,
        y1=None,
        x2=None,
        y2=None,
        createdAt=datetime.utcnow(),
        updatedAt=datetime.utcnow()
    ) for qid, p_type in zip(q_list, puzzle_types)]

    result = db.puzzles.insert_many(docs, ordered=False)
    log.info(
        f"Inserted {len(result.inserted_ids)} documents")


def read_all_from_db() -> dict[str, list[str]]:
    """
    Loads existing puzzle data from the database.\n
    Returns a dictionary where all puzzle question ids are grouped by their type\n
    Puzzles that are NOT broken are put together, because we don't care whether they are actually solved,
    just that they are SOLVABLE
    """
    cursor = db.puzzles.find({}, projection=dict(
        question=True, typ=True, _id=False))

    ret = dict(broken=[], existing=[])

    for doc in cursor:

        if doc['typ'] == 'broken':
            ret['broken'].append(doc["question"])
        else:
            ret['existing'].append(doc["question"])

    return ret


def load_questions(num_tasks: int = 100, num_reqs: int = 100) -> None:
    """
    Queries the API endpoint for new puzzles and stores their question ids.\n
    New puzzle ids will then be loaded.
    """

    payload = dict(api_key=os.environ["CUTCHA_API_KEY"])

    headers = {
        'Origin': 'https://cutcaptcha.com',
        'Referer': f'{os.environ["CUTCHA_API_URL"]}/{os.environ["CUTCHA_API_KEY"]}.html',
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }

    results = dict(existing=0, duplicate=0, broken=0)

    db_data = read_all_from_db()

    existing_qids = db_data['existing']
    failed_qids = db_data['broken']
    loaded_qids = []

    log.info(
        f'Currently {len(existing_qids)} existing and {len(failed_qids)} broken questions')

    log.info(
        f'Starting {num_tasks} tasks with {num_reqs} requests each => Performing {num_tasks * num_reqs} requests in total!')

    async def produce(sess: aiohttp.ClientSession, queue: asyncio.Queue, cnt: int):

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
                            log.warning(
                                f'Recieved JSON without question: {content}')

                    except aiohttp.ContentTypeError as cte:

                        attempts += 1

                        if attempts > 2:
                            log.error('Canceling producer...')
                            break

                        txt = await response.text()
                        log.warning(
                            f'Attempt #{attempts}: Recieved non-JSON: {txt}\nError: {cte}')

            except aiohttp.ClientConnectionError as ce:
                log.error(f'Producer failed with {ce}')
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

        async with aiohttp.ClientSession(headers=headers) as sess:
            producers = [asyncio.create_task(
                produce(sess, queue, num_reqs)) for _ in range(num_tasks)]

            log.info('Waiting for producers...')
            await asyncio.gather(*producers)

        log.info('Waiting for queue processing...')
        await queue.join()

        log.info('Canceling consumer')
        consumer.cancel()

    start = time.perf_counter()
    asyncio.run(produce_and_consume())
    elapsed = time.perf_counter() - start

    log.info(
        f'Recieved {len(loaded_qids)} new questions in {elapsed:.2f} seconds')
    log.info(f'DUPLICATES DURING THIS RUN: {results["duplicate"]}')
    log.info(f'ALREADY EXISTED (SOLVABLE): {results["existing"]}')
    log.info(f'ALREADY EXISTED (BROKEN): {results["broken"]}')

    return load_images(loaded_qids)


def load_images(questions: list[str]) -> None:
    """
    Tries to load the parts for each given puzzle id.\n
    - When all parts were loaded correctly, the puzzle id will be
    stored in the database as 'unknown' (puzzle that is solvable).
    The puzzle parts will be saved to disk (we already used up the bandwidth,
    so we might as well use the actual image data,
    like for some image processing action with OpenCV)
    - Otherwise its stored as 'broken'
    (puzzle that is NOT solvable, since you can't download (and therefor see) atleast one of the parts)
    """

    if not len(questions):
        log.info('Nothing to do')
        return

    failed = []
    success = []

    CUTCHA_URL = f'{os.environ["CUTCHA_API_URL"]}/{os.environ["CUTCHA_API_KEY"]}'

    async def fetch_imgs(session: aiohttp.ClientSession, qid: str):

        cut = part0 = part1 = part2 = None

        try:
            async with session.get(f'{CUTCHA_URL}/{qid}/cut.png') as response:

                content = await response.read()
                if len(content) > 50:
                    cut = content

            async with session.get(f'{CUTCHA_URL}/{qid}/part0.png') as response:

                content = await response.read()
                if len(content) > 50:
                    part0 = content

            async with session.get(f'{CUTCHA_URL}/{qid}/part1.png') as response:

                content = await response.read()
                if len(content) > 50:
                    part1 = content

            async with session.get(f'{CUTCHA_URL}/{qid}/part2.png') as response:

                content = await response.read()
                if len(content) > 50:
                    part2 = content

        except aiohttp.ClientError as e:
            log.error(f'{qid} got error: {e}')

        if cut and part0 and part1 and part2:

            success.append(qid)

            try:
                os.makedirs(f'./train/{qid}')

                with open(f'./train/{qid}/cut.png', 'wb') as fd:
                    fd.write(cut)
                with open(f'./train/{qid}/part0.png', 'wb') as fd:
                    fd.write(part0)
                with open(f'./train/{qid}/part1.png', 'wb') as fd:
                    fd.write(part1)
                with open(f'./train/{qid}/part2.png', 'wb') as fd:
                    fd.write(part2)
            except OSError:
                log.info(f'{qid} exists locally, skipping...')

        else:
            failed.append(qid)

    async def fetch_all(qids: list[str]):

        async with aiohttp.ClientSession() as sess:

            tasks = [asyncio.create_task(fetch_imgs(
                sess, qid.strip())) for qid in qids]

            log.info(f'Loading {len(qids)} puzzles...')
            await asyncio.gather(*tasks)

            log.info(f'Fetched {len(success)} puzzles successfully!')
            log.info(f'Failed to fetch {len(failed)} puzzles!')

    start = time.perf_counter()
    asyncio.run(fetch_all(questions))
    elapsed = time.perf_counter() - start

    log.info(f'Inserting new puzzles into database...')
    insert_into_db(success + failed, ['unknown'] *
                   len(success) + ['broken'] * len(failed))
    log.info(f'Done after {elapsed:.2f} seconds')


load_questions(50, 150)
client.close()
