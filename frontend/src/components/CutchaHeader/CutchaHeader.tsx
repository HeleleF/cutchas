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
            <button className="btn" onClick={onSubmit}>
                Submit
            </button>
            {cid && <p className="CutchaId">{cid}</p>}

            <button className="btn report" onClick={onReport}>
                Report
            </button>
        </div>
    );
}

export default CutchaHeader;
