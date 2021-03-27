import { ApiError, PuzzleData, PuzzleSubmitData } from '../types/puzzle';

export const getRandomPuzzle = async (): Promise<PuzzleData | ApiError> => {
    try {
        const resp = await fetch('/api/puzzle/new');
        return await resp.json();
    } catch (err) {
        return { error: err.message };
    }
};

export const submitPuzzle = async (solution: PuzzleSubmitData): Promise<unknown | ApiError> => {
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

export const reportPuzzle = async (puzzleId: string): Promise<unknown | ApiError> => {
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
        return { error: err.message };
    }
};
