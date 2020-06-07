#!/usr/bin/env python3
import argparse
import asyncio
import logging
import os
import pathlib
import time

from itertools import groupby
from sys import version_info

from aiohttp import ClientConnectionError, ClientError, ClientSession, TCPConnector, ContentTypeError

assert version_info >= (3, 7), 'Install Python 3.7 or higher'

log = logging.getLogger('cutcha')
log.setLevel(logging.DEBUG)

#fh = logging.FileHandler('./cutcha.log', 'w', 'utf-8')
ch = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s', '%Y-%m-%d %H:%M:%S')
#fh.setFormatter(formatter)
ch.setFormatter(formatter)

#log.addHandler(fh)
log.addHandler(ch)


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

    with open('failed.txt', 'r') as ff:
        failed_qids = [f.strip() for f in ff.readlines()]

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
    
        conn = TCPConnector(ssl=False)
        async with ClientSession(connector=conn, headers=headers) as sess:
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

    if len(loaded_qids):
        with open('questions.txt', 'a') as qf:
            for line in loaded_qids:
                qf.write(f'{line}\n')

    log.info(f'Recieved {len(loaded_qids)} new questions in {elapsed:.2f} seconds')
    log.info(f'ALREADY EXISTED: {results["existing"]}')
    log.info(f'DUPLICATES DURING THIS RUN: {results["duplicate"]}')
    log.info(f'KNOWN TO BE BROKEN: {results["broken"]}')


def load_images(path_to_questions: str = 'questions.txt'):

    failed = []

    async def fetch_imgs(session: ClientSession, qid: str):

        ret_val = True

        try:
            async with session.get(f'https://cutcaptcha.com/captcha/SAs61IAI/{qid}/cut.png') as response:

                content = await response.read()
                if len(content) < 50:
                    ret_val = False
                else:
                    with open(f'./train/{qid}_cut.png', 'wb') as fd:
                        fd.write(content)
                    
            async with session.get(f'https://cutcaptcha.com/captcha/SAs61IAI/{qid}/part0.png') as response:

                content = await response.read()
                if len(content) < 50:
                    failed.append(qid)
                    ret_val = False
                else:
                    with open(f'./train/{qid}_part0.png', 'wb') as fd:
                        fd.write(content)

            async with session.get(f'https://cutcaptcha.com/captcha/SAs61IAI/{qid}/part1.png') as response:

                content = await response.read()
                if len(content) < 50:
                    failed.append(qid)
                    ret_val = False
                else:
                    with open(f'./train/{qid}_part1.png', 'wb') as fd:
                        fd.write(content)

            async with session.get(f'https://cutcaptcha.com/captcha/SAs61IAI/{qid}/part2.png') as response:

                content = await response.read()
                if len(content) < 50:
                    failed.append(qid)
                    ret_val = False
                else:
                    with open(f'./train/{qid}_part2.png', 'wb') as fd:
                        fd.write(content)

        except ClientError as e:
            log.error(f'{qid} got error: {e}')
            ret_val = False

        return ret_val

    async def fetch_all(qids):
        async with ClientSession() as sess:

            tasks = [asyncio.create_task(fetch_imgs(sess, qid.strip())) for qid in qids]

            log.info(f'Fetching {len(qids)} puzzles...')
            result = await asyncio.gather(*tasks)

            log.info(f'Fetched {result.count(True)} puzzles successfully!')

    with open(path_to_questions, 'r') as infile:
        questions = infile.readlines()

    start = time.perf_counter()
    asyncio.run(fetch_all(questions))
    elapsed = time.perf_counter() - start

    with open('failed.txt', 'a') as outfile:
        for line in failed:
            outfile.write(f'{line}\n')

    log.info(f'Done after {elapsed:.2f} seconds')


def structure_train_data(img_dir: str = './train', dest_dir: str = './train', ignore_missing = False):

    data = [p for p in pathlib.Path(img_dir).iterdir() if p.is_file()]
    cnt = len(data)

    if not cnt:
        log.info(f'Nothing to do!')
        return

    if cnt % 4 != 0:
        log.warning(f'Found {cnt} images, which is not a multiple of 4! Check yo self before u wreck yo self!')
    else:
        log.info(f'Found {cnt} images, expecting {cnt // 4} new ids')

    def keyfunc(x: pathlib.Path):
        return x.stem.split('_')[0]

    data = sorted(data, key=keyfunc)

    results = dict(created=0, duplicate=0, missing=0)

    for k, g in groupby(data, keyfunc):
    
        imgs = list(g)

        if len(imgs) != 4:
            results['missing'] += 1

            if not ignore_missing:
                log.error(f'Missing some {k}, skipping...')
                continue

        try:
            os.makedirs(f'{dest_dir}/{k}')
        except OSError:
            #log.warning(f'Found duplicate {k}, skipping...')
            results['duplicate'] += 1
            continue

        for f in imgs:

            newf = pathlib.Path(f'{dest_dir}/{k}/{f.stem.split("_")[1]}{f.suffix}')
            f.replace(newf)
        results['created'] += 1

    log.info(f'CREATED: {results["created"]}')
    log.info(f'DUPLICATES: {results["duplicate"]}')
    log.info(f'MISSING: {results["missing"]}')

    [p.unlink() for p in pathlib.Path(img_dir).iterdir() if p.is_file()]


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Load and store cutcaptcha puzzles')

    parser.add_argument('-q', '--load_questions', dest='q', action='store_true', help='If passed, new question ids will be loaded')
    parser.add_argument('-n', dest='n', type=int, default=100, metavar='N', help='How many tasks to start. (Defaults to 100) Only works when -q is passed')
    parser.add_argument('-r', dest='r', type=int, default=100, metavar='R', help='How many requests to do per task. (Defaults to 100) Only works when -q is passed')

    parser.add_argument('-i', '--load_images', dest='i', action='store_true', help='If passed, images will be loaded for all questions in questions.txt')
    parser.add_argument('-f', dest='f', type=str, default='questions.txt', metavar='Q_FILE', help='The path to the file containing the question ids. (Defaults to questions.txt) Only works when -i is passed')
    
    parser.add_argument('-s', '--structure_data', dest='s', action='store_true', help='If passed, all files in ./train will be structured into dirs')
    parser.add_argument('-d', dest='d', type=str, default='./train', metavar='IMG_DIR', help='The path to the dir containing all puzzles. (Defaults to ./train) Only works when -s is passed')
    parser.add_argument('-o', dest='o', type=str, default='./train', metavar='DEST_DIR', help='The path to the destination dir. (Defaults to ./train) Only works when -s is passed')
    parser.add_argument('-m', dest='m', action='store_true', help='If passed, missing images for a question will be ignored and the dir is created anyway. Only works when -s is passed')
    args = parser.parse_args()

    if args.q:
        load_questions(args.n, args.r)
    if args.i:
        load_images(args.f)
    if args.s:
        structure_train_data(args.d, args.o, args.m)
