# Cutcha frontend

This is the cutcha frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Structure

-   `public/` Static assets
-   `src/` Everything React-related goes here
    -   new components go into `src/components/NAME/NAME.tsx`
    -   styling for components goes into `src/components/NAME/NAME.css`
    -   tests for components go into `src/tests/NAME.test.tsx`
-   `build/` Optimized output dir for deployment after running `npm run build`

## Development

First, start the API server by running `npm run start:dev` in the `backend/` directory. Without this, no puzzles will be displayed (_no shit, sherlock?_).

Then run `npm start` (here in the `frontend/` directory) to start a develoment server on `localhost:3000` with hot reload.

In VS Code, using the _Split terminal_ function works really well for this.

## Notes

-   Code formatting

Automatically done with _Eslint_ and _Prettier_. In VS Code, its recommended to install the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).

-   public `.env` file

After `npm run build`, the generated `index.html` contains some inline JS code, which upsets the [CSP set by helmet](https://github.com/helmetjs/helmet#reference).

To fix this, one can set `INLINE_RUNTIME_CHUNK=false` to prevent react from doing this :)

See [this Stackoverflow question](https://stackoverflow.com/q/55160698) and [the React documentation on env files](https://create-react-app.dev/docs/adding-custom-environment-variables/).

-   `proxy` key in `package.json`

Requests are proxied to `localhost:3001` during development, so we can write requests in react like this:

```js
await fetch('/api/puzzle/new');
```

without specifying the domain. This is necessary because in deployment (on heroku) the site and the server will run from the same port.
