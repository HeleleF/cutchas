import { Request, Response } from 'express';

export const validate = async (req: Request, res: Response): Promise<void> => {
    if (!req.header('apiKey') || req.header('apiKey') !== process.env.API_KEY) {
        res.status(401).json({ status: 'error', message: 'Unauthorized.' });
        return;
    }
    res.status(200).json({});
};
