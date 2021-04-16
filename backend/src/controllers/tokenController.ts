import { Request, Response } from 'express';
import { Puzzle } from '../models/Puzzle.js';
import { CutchaApiResult, CutchaPuzzleSubmitResult } from '../types/cutcha.js';
import axiosInstance from '../util/axios.js';
import { CUTCHA_SUBMIT_PAYLOAD } from '../util/cutcha.js';
import { SECRETS } from '../util/secrets.js';

export const validate = async (req: Request, res: Response): Promise<void> => {
    if (
        !req.header('apiKey') ||
        req.header('apiKey') !== SECRETS.TOKEN_ENDPOINT_API_KEY
    ) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }

    const { data } = await axiosInstance.post<CutchaApiResult>(
        `${SECRETS.CUTCHA_API_URL}/${SECRETS.CUTCHA_API_KEY}.json`,
        {
            api_key: SECRETS.CUTCHA_API_KEY,
        },
    );

    if ('string' === typeof data) {
        res.status(500).json({
            error: `Expected json, but recieved ${data}`,
        });
        return;
    }

    if (!data.succ) {
        res.status(500).json(data);
        return;
    }

    const { captcha_question, captcha_token } = data;

    const solution = await Puzzle.findOne({
        question: captcha_question,
        typ: 'solved',
    });

    if (!solution) {
        res.status(500).json({ error: 'Not solved' });
        return;
    }

    const { x0, x1, x2, y0, y1, y2 } = solution;

    const { data: result } = await axiosInstance.post<CutchaPuzzleSubmitResult>(
        `${SECRETS.CUTCHA_API_URL}/${SECRETS.CUTCHA_API_KEY}/check`,
        {
            ...CUTCHA_SUBMIT_PAYLOAD,
            captcha_token,
            solution: [
                [x0, y0, 0],
                [x1, y1, 0],
                [x2, y2, 0],
            ],
        },
    );

    if ('string' === typeof result) {
        res.status(500).json({ error: result });
        return;
    }

    if (!result.succ) {
        res.status(500).json({ error: result.err });
        return;
    }

    if (!result.correct) {
        res.status(500).json({ error: 'not correct' });
        return;
    }

    res.status(200).json({ token: captcha_token });
};
