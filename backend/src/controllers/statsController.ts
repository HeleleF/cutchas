import { Request, Response } from 'express';
import { Puzzle } from '../models/Puzzle.js';

export const getStats = async (_: Request, res: Response): Promise<void> => {
    try {
        const result = await Puzzle.aggregate([
            {
                $group: {
                    _id: '$typ',
                    typCount: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            result: result.sort((x, y) => x._id.localeCompare(y._id)),
        });
    } catch (err) {
        console.log('Failed with ', err);
        res.status(500).json({ error: err });
    }
};
