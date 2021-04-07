import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Puzzle } from '../models/Puzzle.js';
import { CutchaPuzzle, CutchaPuzzleSubmitResult } from '../types/cutcha.js';
import axiosInstance, { loadParts } from '../util/axios.js';
import { SECRETS } from '../util/secrets.js';

const payload = {
    f: '',
    i: '4256A7a1XEiEL72IUdPL97ei7EuEEAuu',
    ip: 0,
    papi:
        'ObSji8QE5hJIU947p50ySuF3isUIO4KswlERKBm/oLgbFujikI1G0dg04SJWCcs5f73VHChCnS+DbMuG5fudZUVBiQkDLq8vb3L/dHY8QacOSQSr6raGu8CaiQvBxwithYvYDiqUwiL+e2CeC5EF85kb4upaLJXTuJ8kUm/tZeZSQIoaeHelLjk4QNXhtt/WRS/0agKvytpoehx444gMz3R9EUhXbUk+PNrsazYDqmlIShMDq+6M+xBarz2PMtL5f8Vv7YYvuvoNPOizPtmmKht9ST+AVEJe/kY5B0GC7b+QEX3VFgR5vpGBQHt9ohw4SyCVAkX4I56wt2NdcaeO/7PjkZNtZrqO4hhs6SYZjc7pa2mj786V7A==',
};

export const getPuzzle = async (_: Request, res: Response): Promise<void> => {
    // repeat until we get a puzzle thats either UNSOLVED or NEW
    // TODO(helene): when the number of solved puzzles increases, this method will
    // take longer and longer until it becomes an infinite loop. How do we fix this?

    let tries = 10;

    do {
        const { data } = await axiosInstance.post<CutchaPuzzle>(
            `${SECRETS.CUTCHA_API_URL}/${SECRETS.CUTCHA_API_KEY}.json`,
            {
                api_key: SECRETS.CUTCHA_API_KEY,
            },
        );

        if (!data.succ) {
            res.status(500).json(data);
            return;
        }

        console.log(`Recieved new puzzle: ${data.captcha_question}`);
        const maybeSolved = await Puzzle.findOne({
            question: data.captcha_question,
            typ: 'solved',
        });
        if (maybeSolved) continue;

        const images = await loadParts(data.captcha_question);
        if (!images) continue; // TODO(helene): mark as broken while we're here

        res.status(200).json({
            id: data.captcha_question,
            token: data.captcha_token,
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

    const { data } = await axiosInstance.post<CutchaPuzzleSubmitResult>(
        `${SECRETS.CUTCHA_API_URL}/${SECRETS.CUTCHA_API_KEY}/check`,
        {
            ...payload,
            captcha_token: token,
            solution: [
                [x0, y0, 0],
                [x1, y1, 0],
                [x2, y2, 0],
            ],
        },
    );

    if ('string' === typeof data) {
        res.status(422).json({ error: data });
        return;
    }

    if (!data.succ) {
        res.status(422).json({ error: data.err });
        return;
    }

    if (!data.correct) {
        res.status(422).json({ error: 'not correct' });
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
