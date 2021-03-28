import './App.css';

import React, { useEffect, useState } from 'react';
import { DraggableData } from 'react-draggable';

import CutchaHeader from './components/CutchaHeader/CutchaHeader';
import Cutcha from './components/Cutcha/Cutcha';
import CutchaStats from './components/CutchaStats/CutchaStats';

import { getRandomPuzzle, reportPuzzle, submitPuzzle } from './api/puzzle';
import { getPuzzleStats } from './api/stats';

import {
    ApiError,
    PuzzleData,
    PuzzleDataRequest,
    PuzzleSolution,
    PuzzleTypeCount,
} from './types/puzzle';

function App(): JSX.Element {
    const [puzzleData, setPuzzleData] = useState({
        puzzle: null,
        loading: true,
    } as PuzzleDataRequest);
    const [solution, setSolution] = useState({
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    } as PuzzleSolution);
    const [stats, setStats] = useState([] as PuzzleTypeCount[]);
    const [scaleFactor] = useState(2.5);
    const [error, setError] = useState(null as string | null);

    const getStats = async () => {
        const newStats = await getPuzzleStats();
        setStats(newStats);
    };

    const getPuzzle = async () => {
        const pd = await getRandomPuzzle();
        if ((pd as ApiError).error) {
            setError((pd as ApiError).error);
        } else {
            setPuzzleData({ puzzle: pd as PuzzleData, loading: false });
        }
    };

    useEffect(() => void getPuzzle(), []);

    useEffect(() => {
        getStats();
        const intervalId = setInterval(getStats, 60000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="App">
            {error && <p>{error}</p>}
            <CutchaHeader
                cid={puzzleData?.puzzle?.id}
                onSubmit={() => {
                    const pd = puzzleData.puzzle;
                    if (!pd) return;

                    setPuzzleData({ puzzle: null, loading: true });
                    submitPuzzle({
                        ...pd,
                        ...solution,
                    }).then(getPuzzle);
                }}
                onReport={() => {
                    const pid = puzzleData.puzzle?.id;
                    if (!pid) return;

                    setPuzzleData({ puzzle: null, loading: true });
                    reportPuzzle(pid).then(getPuzzle);
                }}
            />
            {puzzleData.loading ? (
                <p className="loader">Loading...</p>
            ) : (
                <Cutcha
                    onDragEnd={(num: number, { node, x, y }: DraggableData) => {
                        setSolution((sol) => ({
                            ...sol,
                            [`x${num}`]: Math.round((node.offsetLeft + x) / scaleFactor),
                            [`y${num}`]: Math.round((node.offsetTop + y) / scaleFactor),
                        }));
                    }}
                    scaleFactor={scaleFactor}
                    cid={puzzleData.puzzle.id}
                />
            )}
            <CutchaStats stats={stats} />
        </div>
    );
}

export default App;
