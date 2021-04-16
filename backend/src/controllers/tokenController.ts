import { Request, Response } from 'express';
import { SECRETS } from '../util/secrets.js';

export const validate = async (req: Request, res: Response): Promise<void> => {
    if (
        !req.header('apiKey') ||
        req.header('apiKey') !== SECRETS.TOKEN_ENDPOINT_API_KEY
    ) {
        res.status(401).json({ status: 'error', message: 'Unauthorized.' });
        return;
    }
    res.status(200).json({});
};
