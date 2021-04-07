import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { getRandomPuzzle, submitPuzzle } from '../api/puzzle';
import { PuzzleDataAll, PuzzleSubmitData } from '../types/puzzle';

const defaultPuzzle: PuzzleDataAll | null = null;
const defaultSolution: PuzzleSubmitData | null = null;

type PuzzleApiHookReturn = [
    { puzzle: PuzzleDataAll | null; isLoading: boolean; isError: boolean },
    Dispatch<SetStateAction<PuzzleSubmitData | null>>,
];

export default function usePuzzleApi(): PuzzleApiHookReturn {
    const [puzzle, setPuzzle] = useState(defaultPuzzle);
    const [solution, setSolution] = useState(defaultSolution);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let requestCanceled = false;

        const fetchPuzzle = async () => {
            setIsLoading(true);
            setIsError(false);

            if (solution) {
                await submitPuzzle(solution);
            }

            try {
                const pd = await getRandomPuzzle();
                if (!requestCanceled) {
                    setPuzzle(pd);
                    setIsLoading(false);
                }
            } catch (_) {
                if (!requestCanceled) {
                    setIsError(true);
                    setIsLoading(false);
                }
            }
        };
        fetchPuzzle();

        return () => {
            requestCanceled = true;
        };
    }, [solution]);

    return [{ puzzle, isLoading, isError }, setSolution];
}
