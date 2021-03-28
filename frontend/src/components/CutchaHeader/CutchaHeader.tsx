import './CutchaHeader.css';

import React from 'react';

interface CutchaHeaderProps {
    cid?: string;
    onSubmit: () => void;
    onReport: () => void;
}

function CutchaHeader({ cid, onSubmit, onReport }: CutchaHeaderProps): JSX.Element {
    return (
        <div className="CutchaHeader">
            <button className="btn" title="Submit your solution" onClick={onSubmit}>
                Submit
            </button>
            {cid && <p className="CutchaId">{cid}</p>}

            <button className="btn report" title="Report this puzzle as broken" onClick={onReport}>
                Report
            </button>
        </div>
    );
}

export default CutchaHeader;
