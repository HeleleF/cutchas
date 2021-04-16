import { Request, Response } from 'express';
import { Puzzle } from '../models/Puzzle.js';
import { requestNewCutcha, validateCutcha } from '../util/cutcha.js';
import { SECRETS } from '../util/secrets.js';

export const validate = async (req: Request, res: Response): Promise<void> => {
    if (
        !req.header('apiKey') ||
        req.header('apiKey') !== SECRETS.TOKEN_ENDPOINT_API_KEY
    ) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }

    // 1. Request a new puzzle
    const maybeCutcha = await requestNewCutcha();
    if (!maybeCutcha) {
        res.status(500).json({ error: 'Failed to get a new cutcha' });
        return;
    }
    const { captcha_question, captcha_token } = maybeCutcha;

    // 2. Look up solution in our database
    const solution = await Puzzle.findOne({
        question: captcha_question,
        typ: 'solved',
    });

    if (!solution) {
        res.status(500).json({ error: 'Not solved' });
        return;
    }

    // 3. Validate token by submitting our solution
    const valid = await validateCutcha(captcha_token, solution);
    if (!valid) {
        res.status(500).json({ error: 'Faild to validate token' });
        return;
    }

    // 4. Token is now valid for two minutes
    res.status(200).json({ token: captcha_token });
};
