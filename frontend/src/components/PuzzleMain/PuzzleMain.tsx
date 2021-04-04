import './PuzzleMain.css';

import { CUTCHA_API_URL } from '../../constants/cutcha';
import ScalableImage from '../ScalableImage/ScalableImage';

interface PuzzleMainProps {
    scaleFactor: number;
    id: string;
}

function PuzzleMain({ scaleFactor, id }: PuzzleMainProps): JSX.Element {
    return (
        <ScalableImage
            scaleFactor={scaleFactor}
            className="PuzzleMain"
            src={`${CUTCHA_API_URL}/${id}/cut.png`}
        />
    );
}

export default PuzzleMain;
