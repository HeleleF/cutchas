import './App.css';

import React, { useEffect, useState } from 'react';
import { DraggableData } from 'react-draggable';

import Cutcha from './components/Cutcha/Cutcha';

import { getRandomPuzzle, submitPuzzle } from './api/puzzle';
import { getPuzzleStats } from './api/stats';

import { PuzzleData, PuzzleSolution, PuzzleStats } from './types/puzzle';

function App(): JSX.Element {
    const [puzzleData, setPuzzleData] = useState({ id: null, token: null } as PuzzleData);
    const [solution, setSolution] = useState({
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    } as PuzzleSolution);
    const [stats, setStats] = useState({} as PuzzleStats);
    const [scaleFactor] = useState(2.5);
    const [solvedCount, setSolveCount] = useState(0);

    const getStats = async () => {
        const newStats = await getPuzzleStats();
        setStats(newStats);
    };

    useEffect(() => {
        console.log('interval effect');
        getStats();
        const intervalId = setInterval(getStats, 120000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        console.log('get puzzle effect');
        getRandomPuzzle().then((data) => setPuzzleData(data));
    }, [solvedCount]);

    const updateSolution = (num: number, { node, x, y }: DraggableData) => {
        setSolution((sol) => {
            return {
                ...sol,
                [`x${num}`]: Math.round((node.offsetLeft + x) / scaleFactor),
                [`y${num}`]: Math.round((node.offsetTop + y) / scaleFactor),
            };
        });
    };

    const onClick = () => {
        submitPuzzle({
            ...puzzleData,
            ...solution,
        }).then((correct) => {
            console.log(correct);
            if (correct) setSolveCount((solved) => solved + 1);
        });
    };

    console.log('render');

    return (
        <div className="App">
            <button onClick={onClick}>Submit</button>
            <strong>Solved so far: {solvedCount}</strong>
            {puzzleData.id ? (
                <Cutcha onDragEnd={updateSolution} scaleFactor={scaleFactor} cid={puzzleData.id} />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default App;
