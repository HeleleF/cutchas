# Cutchas

Learning things about Javascript and Python by deobfuscating captcha sites and figuring out how and why they work.


### Project Structure
* `deobfuscation/`: JS files containing the captcha logic
* `manual/`: Website to solve puzzles locally
* `server/`: The local server required for the website
* `testing/`: Playground to test things with Jupyter Notebook and JS
* `cutcha.py`: Script used to load and insert the puzzle into the database
- Gitignored
  * `train/`: All complete puzzles
  * `failed/`: All puzzles with some missing parts
  * `server/sqlite.db`: the sqlite3 database


### Current stats
```sql
sqlite> SELECT typ, COUNT(typ) FROM puzzle GROUP BY typ;
broken|122
solved|86
unknown|28908
```

### Manual solving

1. Start the webserver by running `python3 server/app.py`
  - Note that this is a dev server only! 
2. Open the `manual/harvest.html` file with a browser of your choice
3. Start solving! 👌
4. Correct solutions will be inserted into the database


### Roadmap

1. Use something better than `sqlite3`, like Postgres
2. Host the database somewhere
3. Host the server logic somewhere
4. Now everyone can contribute to solving cutchas
5. After some time (depending on the number of people willing to solve), cutchas will be solved completely 😎
6. Provide browser extension that automatically checks for cutcaptchas and tries to solve them by looking them up in the database
