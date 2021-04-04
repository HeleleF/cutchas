import { PuzzleDataApiResponse, PuzzleSubmitData } from '../types/puzzle';

export const getRandomPuzzle = async (): Promise<PuzzleDataApiResponse> => {
    try {
        const resp = await fetch('/api/puzzle/new');
        const pd = await resp.json();

        return {
            error: false,
            data: pd,
        };
    } catch (err) {
        return { error: true, data: err.message };
    }
};

export const submitPuzzle = async (solution: PuzzleSubmitData): Promise<unknown> => {
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
        return { error: true, data: err.message };
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
