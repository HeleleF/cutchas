import { DraggableData } from 'react-draggable';
import { CUTCHA_API_URL } from '../../constants/cutcha';
import ScalableImage from '../ScalableImage/ScalableImage';
import './PuzzlePiece.css';

interface PuzzlePieceProps {
    onDragEnd: (num: number, dragData: DraggableData) => void;
    scaleFactor: number;
    id: string;
    partNumber: 0 | 1 | 2;
}

function PuzzlePiece({ onDragEnd, id, scaleFactor, partNumber }: PuzzlePieceProps): JSX.Element {
    return (
        <ScalableImage
            scaleFactor={scaleFactor}
            onDragEnd={onDragEnd.bind(null, partNumber)}
            className="PuzzlePiece"
            title={`Puzzle Piece ${partNumber + 1}`}
            src={`${CUTCHA_API_URL}/${id}/part${partNumber}.png`}
        />
    );
}

export default PuzzlePiece;
