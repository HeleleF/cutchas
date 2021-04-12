import { PuzzleTypeCount } from '../types/puzzle';

export const getPuzzleStats = async (): Promise<PuzzleTypeCount[]> => {
    try {
        const resp = await fetch('/api/stats');
        const data = await resp.json();

        return data.result;
    } catch (err) {
        console.log(err);
        return [];
    }
};
