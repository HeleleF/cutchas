import { Router } from 'express';

import * as puzzleController from '../controllers/puzzleController.js';
import { check } from 'express-validator';

const puzzleRouter = Router();

puzzleRouter
    .get('/', puzzleController.getPuzzle)
    .post(
        '/',
        [
            check('token')
                .isLength({ min: 32, max: 32 })
                .withMessage('Not length 32!')
                .bail()
                .isBase64()
                .withMessage('Not a base64 string'),
            check('x0').isInt({ min: 0, max: 500 }).withMessage('Not an int!'),
            check('x1').isInt({ min: 0, max: 500 }).withMessage('Not an int!'),
            check('x2').isInt({ min: 0, max: 500 }).withMessage('Not an int!'),
            check('y0').isInt({ min: 0, max: 500 }).withMessage('Not an int!'),
            check('y1').isInt({ min: 0, max: 500 }).withMessage('Not an int!'),
            check('y2').isInt({ min: 0, max: 500 }).withMessage('Not an int!'),
            check('id')
                .isLength({ min: 36, max: 36 })
                .withMessage('Not length 36!')
                .bail()
                .isUUID(4)
                .withMessage('Not a UUID'),
        ],
        puzzleController.submitPuzzle,
    )
    .get('/*', (_, res) => {
        res.status(404).json({ error: 'not a valid puzzle route' });
    });

export default puzzleRouter;
