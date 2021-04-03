# Cutchas

Learning things about Javascript and Python by deobfuscating captcha sites and figuring out how and why they work.

## Technologies

- Javascript / Typescript / Node:

  - Deobfuscating the captcha logic, understanding how it works etc.
  - Writing a backend with express
  - Writing a frontend with React

- Python / Jupyter Notebook:

  - Writing scripts to try to bypass the captchas

- Sqlite:

  - storing all the puzzles _(not anymore)_

- MongoDB

  - now used to store everything ✨ _in the cloud_ ✨

- Heroku
  - hosting stuff

### How to get started

1. Install [NodeJS (with NPM)](https://nodejs.org/en/) if you don't have already
2. Fork the repository
3. Switch to the `dev` branch with `git checkout dev`
4. Run `npm install` to install all dependencies for frontend and backend
5. Do stuff
6. Create PR

### Project Structure

- `basics` branch:

  - not really used right now, contains the "old stuff"

  - `deobfuscation/`: JS files containing the captcha logic
  - `manual/`: Website to solve puzzles locally
  - `server/`: The local server required for the website
  - `testing/`: Playground to test things with Jupyter Notebook and JS
  - `cutcha.py`: Script used to load and insert the puzzle into the database

  * Gitignored
    - `train/`: All complete puzzles
    - `failed/`: All puzzles with some missing parts
    - `server/sqlite.db`: the sqlite3 database

- `dev` branch:

  - actual development
  - the only one you need

- `deploy` branch
  - protected, pushing to this branch will deploy on heroku

### Current stats

_UPDATE_: This is outdated, we're now using MongoDB.

```sql
sqlite> SELECT typ, COUNT(typ) FROM puzzle GROUP BY typ;
broken|122
solved|86
unknown|28908
```

### Roadmap

1. Use something better than `sqlite3`, like Postgres ✔️ -> MongoDB
2. Host the database somewhere ✔️ -> Atlas MongoDB
3. Host the server logic somewhere ✔️ -> Heroku
4. Now everyone can contribute to solving cutchas ✔️
5. After some time (depending on the number of people willing to solve), cutchas will be solved completely 😎
6. Provide browser extension that automatically checks for cutcaptchas and tries to solve them by looking them up in the database 🛠

### Manual solving

1. Start the webserver by running `python3 server/app.py`

- Note that this is a dev server only!

2. Open the `manual/harvest.html` file with a browser of your choice
3. Start solving! 👌
4. Correct solutions will be inserted into the database
