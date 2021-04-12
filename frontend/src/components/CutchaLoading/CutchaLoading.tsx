import './CutchaLoading.css';

function CutchaLoading(): JSX.Element {
    return (
        <div className="CutchaLoading" title="Loading...">
            <span className="CutchaLoadingMessage">Loading new puzzle, please wait...</span>
        </div>
    );
}

export default CutchaLoading;
