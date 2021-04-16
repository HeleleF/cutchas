import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import puzzleRouter from './puzzleRouter.js';
import statsRouter from './statsRouter.js';
import tokenRouter from './tokenRouter.js';

const apiRouter = Router();

apiRouter
    .use(
        '/puzzle',
        rateLimit({
            windowMs: 1 * 60 * 1000,
            max: 20,
        }),
        puzzleRouter,
    )
    .use(
        '/stats',
        rateLimit({
            windowMs: 1 * 60 * 1000,
            max: 5,
        }),
        statsRouter,
    )
    .use(
        '/token',
        rateLimit({
            windowMs: 1 * 60 * 1000,
            max: 30,
        }),
        tokenRouter,
    )
    .get('/*', (_, res) => {
        res.status(404).json({ error: 'not a valid route' });
    });

export default apiRouter;
