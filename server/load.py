#!/usr/bin/env python3
import sqlite3
import os

conn = sqlite3.connect('./cutcha.db')
cur = conn.cursor()

def puzzle_data_generator():
    for guid in os.listdir('../train'):
        yield (guid, 'unknown')

def broken_puzzles():
    with open('../failed.txt', 'r') as fd:
        return [(f.strip(), 'broken') for f in fd.readlines()]

print('Inserting...')
cur.executemany("INSERT INTO puzzle (question,typ) values (?,?)", broken_puzzles())
conn.commit()

cur.close()
conn.close()
print('Done.')