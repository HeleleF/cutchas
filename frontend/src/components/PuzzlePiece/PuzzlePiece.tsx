import { ChangeEvent, ImgHTMLAttributes, useRef, useState } from 'react';
import Draggable, { DraggableData } from 'react-draggable';
import './PuzzlePiece.css';

interface PuzzlePieceProps {
    onDragStop: (dragData: DraggableData) => void;
    scale: number;
}

function PuzzlePiece({
    onDragStop,
    scale,
    ...imgProps
}: PuzzlePieceProps & ImgHTMLAttributes<HTMLImageElement>): JSX.Element {
    const imgRef = useRef(null);

    const [height, setHeight] = useState(0);

    return (
        <Draggable
            onStop={(_, data) => onDragStop(data)}
            nodeRef={imgRef}
            bounds=".PuzzlePieceDragArea"
        >
            {/** draggable=false to disable native browser-dragging behavior */}
            <img
                {...imgProps}
                draggable={false}
                ref={imgRef}
                className="PuzzlePiece"
                height={Math.ceil(height * scale)}
                onLoad={({ target }: ChangeEvent<HTMLImageElement>) => {
                    const { naturalHeight } = target;
                    setHeight(naturalHeight);
                }}
            />
        </Draggable>
    );
}

export default PuzzlePiece;
