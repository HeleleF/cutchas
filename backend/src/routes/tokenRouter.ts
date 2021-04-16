import { Router } from 'express';
import * as tokenController from '../controllers/tokenController.js';

const tokenRouter = Router();

tokenRouter.get('/validate', tokenController.validate).get('/*', (_, res) => {
    res.status(404).json({ error: 'not a valid token route' });
});

export default tokenRouter;
