import { useEffect, useState } from 'react';
import { getPuzzleStats } from '../../api/stats';
import { PuzzleTypeCount } from '../../types/puzzle';
import './CutchaStats.css';

function CutchaStats(): JSX.Element {
    const [stats, setStats] = useState([] as PuzzleTypeCount[]);

    const getStats = async () => {
        const newStats = await getPuzzleStats();
        setStats(newStats);
    };

    useEffect(() => {
        getStats();
        const intervalId = setInterval(getStats, 60_000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="CutchaStats" title="Updated every minute">
            {stats.length ? (
                stats.map(({ _id, typCount }) => (
                    <p key={_id}>
                        {typCount} {_id}
                    </p>
                ))
            ) : (
                <p>No data</p>
            )}
        </div>
    );
}

export default CutchaStats;
