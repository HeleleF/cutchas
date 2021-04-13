import { PuzzleDataAll, PuzzleSubmitData, PuzzleSubmitReturn } from '../types/puzzle';

export const getRandomPuzzle = async (): Promise<PuzzleDataAll> => {
    const resp = await fetch('/api/puzzle/new');

    if (!resp.ok) {
        throw new Error(`Recieved status code: ${resp.status}`);
    }

    const pd = await resp.json();

    return pd;
};

export const submitPuzzle = async (solution: PuzzleSubmitData): Promise<PuzzleSubmitReturn> => {
    try {
        const resp = await fetch('/api/puzzle/submit', {
            method: 'POST',
            body: JSON.stringify(solution),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await resp.json();
    } catch (err) {
        return { error: err.message };
    }
};

export const reportPuzzle = async (puzzleId: string): Promise<unknown> => {
    try {
        const resp = await fetch('/api/puzzle/report', {
            method: 'POST',
            body: JSON.stringify({ id: puzzleId }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await resp.json();
    } catch (err) {
        return { error: true, data: err.message };
    }
};
