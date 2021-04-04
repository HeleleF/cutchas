import { PuzzleTypeCount } from '../../types/puzzle';
import './CutchaStats.css';

interface CutchaStatsProps {
    stats: PuzzleTypeCount[];
}

function CutchaStats({ stats }: CutchaStatsProps): JSX.Element {
    return (
        <div className="CutchaStats" title="Updated every minute">
            {stats.map(({ _id, typCount }) => (
                <p key={_id}>
                    {typCount} {_id}
                </p>
            ))}
        </div>
    );
}

export default CutchaStats;
