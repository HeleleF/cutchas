import { Router } from 'express';
import { check } from 'express-validator';
import * as puzzleController from '../controllers/puzzleController.js';

const isValidToken = check('token')
    .isLength({ min: 32, max: 32 })
    .withMessage('Not length 32!')
    .bail()
    .isBase64()
    .withMessage('Not a base64 string');

const isValidId = check('id')
    .isLength({ min: 36, max: 36 })
    .withMessage('Not length 36!')
    .bail()
    .isUUID(4)
    .withMessage('Not a UUID');

const puzzleRouter = Router();

puzzleRouter
    .get('/new', puzzleController.getPuzzle)
    .post(
        '/submit',
        [
            isValidToken,
            check('x0').isInt({ min: 0, max: 488 }).withMessage('Not an int!'),
            check('x1').isInt({ min: 0, max: 488 }).withMessage('Not an int!'),
            check('x2').isInt({ min: 0, max: 488 }).withMessage('Not an int!'),
            check('y0').isInt({ min: 0, max: 488 }).withMessage('Not an int!'),
            check('y1').isInt({ min: 0, max: 488 }).withMessage('Not an int!'),
            check('y2').isInt({ min: 0, max: 488 }).withMessage('Not an int!'),
            isValidId,
        ],
        puzzleController.submitPuzzle,
    )
    .post('/report', [isValidId], puzzleController.reportPuzzle)
    .get('/*', (_, res) => {
        res.status(404).json({ error: 'not a valid puzzle route' });
    });

export default puzzleRouter;
