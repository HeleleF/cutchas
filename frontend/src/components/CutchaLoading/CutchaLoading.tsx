import './CutchaLoading.css';

function CutchaLoading({ scale }: { scale: number }): JSX.Element {
    return (
        <div className="CutchaLoading" title="Loading...">
            <div className="DragAreaStub">
                <div className="StartAreaStub">
                    <span className="PuzzlePieceStub"></span>
                    <span className="PuzzlePieceStub"></span>
                    <span className="PuzzlePieceStub"></span>
                </div>
                <span
                    className="PuzzleMainStub"
                    style={{ width: Math.ceil(scale * 448), height: Math.ceil(scale * 332) }}
                ></span>
            </div>

            <span className="SubmitStub"></span>
        </div>
    );
}

export default CutchaLoading;
