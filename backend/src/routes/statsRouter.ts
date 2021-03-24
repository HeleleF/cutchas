import { Router } from 'express';

import * as statsController from '../controllers/statsController.js';

const statsRouter = Router();

statsRouter.get('/', statsController.getStats);

export default statsRouter;
