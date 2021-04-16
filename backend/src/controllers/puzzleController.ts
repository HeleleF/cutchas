import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Puzzle } from '../models/Puzzle.js';
import { loadParts, requestNewCutcha, validateCutcha } from '../util/cutcha.js';

export const getPuzzle = async (_: Request, res: Response): Promise<void> => {
    // repeat until we get a puzzle thats either UNSOLVED or NEW
    // TODO(helene): when the number of solved puzzles increases, this method will
    // take longer and longer until it becomes an infinite loop. How do we fix this?

    let tries = 10;

    do {
        const maybeCutcha = await requestNewCutcha();
        if (!maybeCutcha) {
            res.status(500).json({ error: 'Failed to get a new cutcha' });
            return;
        }
        const { captcha_question, captcha_token } = maybeCutcha;

        console.log(`Recieved new puzzle: ${captcha_question}`);
        const maybeSolved = await Puzzle.findOne({
            question: captcha_question,
            typ: 'solved',
        });
        if (maybeSolved) continue;

        const images = await loadParts(captcha_question);
        if (!images) continue; // TODO(helene): mark as broken while we're here

        res.status(200).json({
            id: captcha_question,
            token: captcha_token,
            images,
        });
        return;
    } while (tries--);

    res.status(500).json({
        error: 'Could not fetch a puzzle thats either unsolved or not broken!',
    });
};

export const submitPuzzle = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }

    const { id, token, x0, x1, x2, y0, y1, y2 } = req.body;

    const valid = await validateCutcha(token, { x0, x1, x2, y0, y1, y2 });
    if (!valid) {
        res.status(500).json({ error: 'Faild to validate token' });
        return;
    }

    const result = await Puzzle.findOneAndUpdate(
        { question: id },
        {
            typ: 'solved',
            x0,
            y0,
            x1,
            y1,
            x2,
            y2,
        },
        { new: true, upsert: true, rawResult: true, lean: true },
    );

    res.status(200).json({
        upserted: !result.lastErrorObject.updatedExisting,
        puzzle: result.value,
    });
};

export const reportPuzzle = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }

    const { id } = req.body;

    const result = await Puzzle.findOneAndUpdate(
        { question: id, typ: 'unknown' }, // prevent unnecessary updates
        {
            typ: 'broken',
        },
        { new: true, lean: true },
    );

    res.status(200).json({
        reported: !!result,
    });
};
