import { PuzzleTypeCount } from '../types/puzzle';

export const getPuzzleStats = async (): Promise<PuzzleTypeCount[]> => {
    const resp = await fetch('/api/stats');
    const data = await resp.json();
    return data.result;
};
