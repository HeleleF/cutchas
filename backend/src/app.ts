import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/apiRouter.js';
import { SECRETS } from './util/secrets.js';

/**
 * When using Modules in Node (for cool stuff like ts target esnext and top level await)
 * some globals like `__filename` and `__dirname` are not defined.
 *
 * The following "hack" redefines it :)
 * See https://stackoverflow.com/a/50052194
 */
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('port', process.env.PORT || 3001)
    .use(compression())
    .use(
        helmet({
            contentSecurityPolicy: {
                reportOnly: process.env.NODE_ENV !== 'production',
            },
        }),
    )
    .use(
        cors({
            origin:
                process.env.NODE_ENV === 'production' ? SECRETS.SELF_URL : '*',
        }),
    )
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(express.static(join(__dirname, '../../frontend/build')))
    .use('/api', apiRouter)
    .get('/*', (_, res) =>
        res.sendFile(join(__dirname, '../../frontend/build/index.html')),
    );

export default app;
