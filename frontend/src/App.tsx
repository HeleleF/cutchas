import './App.css';

import React, { useEffect, useState } from 'react';
import { DraggableData } from 'react-draggable';

import CutchaHeader from './components/CutchaHeader/CutchaHeader';
import Cutcha from './components/Cutcha/Cutcha';
import CutchaStats from './components/CutchaStats/CutchaStats';

import { getRandomPuzzle, reportPuzzle, submitPuzzle } from './api/puzzle';
import { getPuzzleStats } from './api/stats';

import { PuzzleDataRequest, PuzzleSolution, PuzzleTypeCount } from './types/puzzle';

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

    const getStats = async () => {
        const newStats = await getPuzzleStats();
        setStats(newStats);
    };

    const getPuzzle = async () => {
        const pd = await getRandomPuzzle();
        setPuzzleData({ puzzle: pd, loading: false });
    };

    useEffect(() => {
        console.log('interval effect');
        getStats();
        const intervalId = setInterval(getStats, 120000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        console.log('get puzzle effect');
        getPuzzle();
    }, []);

    const updateSolution = (num: number, { node, x, y }: DraggableData) => {
        setSolution((sol) => {
            return {
                ...sol,
                [`x${num}`]: Math.round((node.offsetLeft + x) / scaleFactor),
                [`y${num}`]: Math.round((node.offsetTop + y) / scaleFactor),
            };
        });
    };

    const onSubmit = () => {
        const pd = puzzleData.puzzle;
        if (!pd) return;

        setPuzzleData({ puzzle: null, loading: true });
        submitPuzzle({
            ...pd,
            ...solution,
        }).then(getPuzzle);
    };

    const onReport = () => {
        const pid = puzzleData.puzzle?.id;
        if (!pid) return;

        setPuzzleData({ puzzle: null, loading: true });
        reportPuzzle(pid).then(getPuzzle);
    };

    console.log('render');

    return (
        <div className="App">
            <CutchaHeader cid={puzzleData?.puzzle?.id} onSubmit={onSubmit} onReport={onReport} />
            {puzzleData.loading ? (
                <p className="loader">Loading...</p>
            ) : (
                <Cutcha
                    onDragEnd={updateSolution}
                    scaleFactor={scaleFactor}
                    cid={puzzleData.puzzle.id}
                />
            )}
            <CutchaStats stats={stats} />
        </div>
    );
}

export default App;
