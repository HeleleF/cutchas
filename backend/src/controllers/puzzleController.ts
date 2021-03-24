import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Puzzle } from '../models/Puzzle.js';
import { CutchaPuzzle, CutchaPuzzleSubmitResult } from '../types/cutcha.js';
import axiosInstance from '../util/axios.js';

const payload = {
    f: '',
    i: '4256A7a1XEiEL72IUdPL97ei7EuEEAuu',
    ip: 0,
    papi:
        'ObSji8QE5hJIU947p50ySuF3isUIO4KswlERKBm/oLgbFujikI1G0dg04SJWCcs5f73VHChCnS+DbMuG5fudZUVBiQkDLq8vb3L/dHY8QacOSQSr6raGu8CaiQvBxwithYvYDiqUwiL+e2CeC5EF85kb4upaLJXTuJ8kUm/tZeZSQIoaeHelLjk4QNXhtt/WRS/0agKvytpoehx444gMz3R9EUhXbUk+PNrsazYDqmlIShMDq+6M+xBarz2PMtL5f8Vv7YYvuvoNPOizPtmmKht9ST+AVEJe/kY5B0GC7b+QEX3VFgR5vpGBQHt9ohw4SyCVAkX4I56wt2NdcaeO/7PjkZNtZrqO4hhs6SYZjc7pa2mj786V7A==',
};

export const getPuzzle = async (_: Request, res: Response): Promise<void> => {
    // const doc = await Puzzle.findOne({ question: "123" });

    // if (!doc) {
    //   res.json({ msg: "not found" });
    //   return;
    // }

    // res.send(doc);

    const { data } = await axiosInstance.post<CutchaPuzzle>(
        'https://cutcaptcha.com/captcha/SAs61IAI.json',
        {
            api_key: 'SAs61IAI',
        },
    );

    if (!data.succ) {
        res.status(500).json(data);
        return;
    }

    res.json({ id: data.captcha_question, token: data.captcha_token });
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
        'https://cutcaptcha.com/captcha/SAs61IAI/check',
        {
            ...payload,
            captcha_token: token, // 'ME6uZaaE8Iv9lxEIFNaF4eiBiLiEaHEt'
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
        { new: true, upsert: true, rawResult: true },
    ).lean();

    res.status(200).json({
        solved: data.correct,
        upserted: !result.lastErrorObject.updatedExisting,
        puzzle: result.value,
    });
};
