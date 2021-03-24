import { PuzzleStats } from '../types/puzzle';

export const getPuzzleStats = async (): Promise<PuzzleStats> => {
    const resp = await fetch('/api/stats');
    const data = await resp.json();
    console.log(data);
    return data;
};
