import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { DraggableData } from 'react-draggable';
import { ReactComponent as SubmitLogo } from '../../assets/login.svg';
import usePuzzleApi from '../../hooks/usePuzzleApi';
import CutchaLoading from '../CutchaLoading/CutchaLoading';
import PuzzlePiece from '../PuzzlePiece/PuzzlePiece';
import './Cutcha.css';

const defaultCoords = {
    x0: 0,
    x1: 0,
    x2: 0,
    y0: 0,
    y1: 0,
    y2: 0,
};

function Cutcha(): JSX.Element {
    const [{ puzzle, isLoading, isError }, setSolution] = usePuzzleApi();
    const [coords, setCoords] = useState(defaultCoords);
    const [scale, setScale] = useState(1);

    const mainRef = useRef<HTMLImageElement>(null);

    const onDragEnd = (partNumber: 0 | 1 | 2, { x, y, node }: DraggableData) => {
        setCoords((coords) => ({
            ...coords,
            [`x${partNumber}`]: Math.round((node.offsetLeft + x - node.offsetWidth) / scale),
            [`y${partNumber}`]: Math.round((node.offsetTop + y) / scale),
        }));
    };

    const handleResize = () => {
        const mainImgHeight = mainRef.current?.height;
        if (!mainImgHeight) return;
        setScale(mainImgHeight / 332); //TODO(helene): can we remove this magic number?
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize, { passive: true });

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="Cutcha">
            {isError && <div>Something went wrong ...</div>}
            {isLoading ? (
                <CutchaLoading scale={scale} />
            ) : (
                <>
                    <div className="PuzzlePieceDragArea">
                        <div className="PuzzlePieceStartArea">
                            <PuzzlePiece
                                scale={scale}
                                src={puzzle?.images[1]}
                                onDragStop={(data) => onDragEnd(0, data)}
                                title={`Puzzle Piece 1`}
                            />
                            <PuzzlePiece
                                scale={scale}
                                src={puzzle?.images[2]}
                                onDragStop={(data) => onDragEnd(1, data)}
                                title={`Puzzle Piece 2`}
                            />
                            <PuzzlePiece
                                scale={scale}
                                src={puzzle?.images[3]}
                                onDragStop={(data) => onDragEnd(2, data)}
                                title={`Puzzle Piece 3`}
                            />
                        </div>
                        <img
                            ref={mainRef}
                            className="PuzzleMain"
                            src={puzzle?.images[0]}
                            onLoad={({ target }: ChangeEvent<HTMLImageElement>) => {
                                const mainImgHeight = mainRef.current?.height;
                                if (!mainImgHeight) return;
                                setScale(mainImgHeight / target.naturalHeight);
                            }}
                        />
                    </div>
                    <div className="CutchaSubmitWrapper">
                        <SubmitLogo
                            className="CutchaSubmit"
                            title="Submit your puzzle solution"
                            onClick={() => {
                                console.log('Submitting solution...');

                                if (!puzzle) return;

                                setSolution({
                                    token: puzzle.token,
                                    id: puzzle.id,
                                    ...coords,
                                });
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default Cutcha;
