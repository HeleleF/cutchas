# Cutcha backend

This is the cutcha backend

## Structure

-   `src/` Everything Express-related goes here

    -   `controllers/`: actual API functions
    -   `models/`: mongoDB schema and stuff
    -   `routes/`: connect api routes to controller functions
    -   `types/`: definitions for typescript, interfaces etc.
    -   `util/`: as per usual, the utility functions 👌
    -   `app.ts`: the main express app that uses all of the above
    -   `server.ts`: the actual entry point that is started with `node`

-   `dist/` Output dir for deployment after running `npm run build`

## Development

To start the API server, run `npm run start:dev` (in this directory).
This runs `tsc` and `nodemon` in parallel.

-   `tsc -w` will recompile everything when `.ts` files change
-   `nodemon` will restart everytime when `server.js` changes (which happens after each recompile)

The other commands are only for the heroku build and deployment process.

## Notes

-   Code formatting

Automatically done with _Eslint_ and _Prettier_. In VS Code, its recommended to install the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).

-   dotenv config

The flag `"-r dotenv/config"` in the `nodemon` command makes all variables from the `.env` file available in `process.env`.

Variables added to this file need to be present in heroku too!

-   Experimental flags

Either every import has `.js` at the end OR `node` is started with the `--experimental modules` flag. Currently the first way is used, but the second would be nicer.
