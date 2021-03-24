import './Cutcha.css';

import React from 'react';
import { DraggableData } from 'react-draggable';

import PuzzleMain from '../PuzzleMain/PuzzleMain';
import PuzzlePiece from '../PuzzlePiece/PuzzlePiece';

interface CutchaProps {
    onDragEnd: (num: number, dragData: DraggableData) => void;
    cid: string;
    scaleFactor: number;
}

function Cutcha({ onDragEnd, cid, scaleFactor }: CutchaProps): JSX.Element {
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
