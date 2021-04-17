import cors from 'cors';
import { Router } from 'express';
import * as tokenController from '../controllers/tokenController.js';
import { SECRETS } from '../util/secrets.js';

const tokenRouter = Router();

tokenRouter
    .use(cors({ origin: SECRETS.TOKEN_ENDPOINT_WHITELIST }))
    .get('/validate', tokenController.validate)
    .get('/*', (_, res) => {
        res.status(404).json({ error: 'not a valid token route' });
    });

export default tokenRouter;
