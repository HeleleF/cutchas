import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import puzzleRouter from './puzzleRouter.js';
import statsRouter from './statsRouter.js';

const apiRouter = Router();

apiRouter
    .use(
        '/puzzle',
        rateLimit({
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 10, // 5 requests,
        }),
        puzzleRouter,
    )
    .use(
        '/stats',
        rateLimit({
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 5, // 5 requests,
        }),
        statsRouter,
    )
    .get('/*', (_, res) => {
        res.status(404).json({ error: 'not a valid route' });
    });

export default apiRouter;
