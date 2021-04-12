import { Router } from 'express';
import * as statsController from '../controllers/statsController.js';

const statsRouter = Router();

statsRouter.get('/', statsController.getStats).get('/*', (_, res) => {
    res.status(404).json({ error: 'not a valid stats route' });
});

export default statsRouter;
