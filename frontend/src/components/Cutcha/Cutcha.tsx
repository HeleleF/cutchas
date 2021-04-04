import { DraggableData } from 'react-draggable';
import PuzzleMain from '../PuzzleMain/PuzzleMain';
import PuzzlePiece from '../PuzzlePiece/PuzzlePiece';
import './Cutcha.css';

interface CutchaProps {
    onDragEnd: (num: number, dragData: DraggableData) => void;
    cid: string | null;
    scaleFactor: number;
}

function Cutcha({ onDragEnd, cid, scaleFactor }: CutchaProps): JSX.Element | null {
    if (!cid) return null;

    return (
        <div className="Cutcha">
            <PuzzleMain scaleFactor={scaleFactor} id={cid} />
            <div className="PuzzlePieceArea">
                <PuzzlePiece
                    onDragEnd={onDragEnd}
                    scaleFactor={scaleFactor}
                    id={cid}
                    partNumber={0}
                />
                <PuzzlePiece
                    onDragEnd={onDragEnd}
                    scaleFactor={scaleFactor}
                    id={cid}
                    partNumber={1}
                />
                <PuzzlePiece
                    onDragEnd={onDragEnd}
                    scaleFactor={scaleFactor}
                    id={cid}
                    partNumber={2}
                />
            </div>
        </div>
    );
}

export default Cutcha;
