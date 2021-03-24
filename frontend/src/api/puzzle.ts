import { PuzzleData, PuzzleSubmitData } from '../types/puzzle';

export const getRandomPuzzle = async (): Promise<PuzzleData> => {
    const resp = await fetch('/api/puzzle');
    const data = await resp.json();
    return data;
};

export const submitPuzzle = async (solution: PuzzleSubmitData): Promise<boolean> => {
    const resp = await fetch('/api/puzzle', {
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
