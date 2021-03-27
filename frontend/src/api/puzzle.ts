import { PuzzleData, PuzzleSubmitData } from '../types/puzzle';

export const getRandomPuzzle = async (): Promise<PuzzleData> => {
    const resp = await fetch('/api/puzzle/new');
    const data = await resp.json();
    return data;
};

export const submitPuzzle = async (solution: PuzzleSubmitData): Promise<boolean> => {
    const resp = await fetch('/api/puzzle/submit', {
        method: 'POST',
        body: JSON.stringify(solution),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await resp.json();
    console.log(data);
    return data.solved;
};

export const reportPuzzle = async (puzzleId: string): Promise<boolean> => {
    const resp = await fetch('/api/puzzle/report', {
        method: 'POST',
        body: JSON.stringify({ id: puzzleId }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await resp.json();
    return data.reported;
};
