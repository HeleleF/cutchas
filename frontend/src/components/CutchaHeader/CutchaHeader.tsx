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
            <button className="btn report" title="Report this puzzle as broken" onClick={onReport}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512.001 512.001"
                    className="icon"
                >
                    <path d="M503.839 395.379l-195.7-338.962C297.257 37.569 277.766 26.315 256 26.315c-21.765 0-41.257 11.254-52.139 30.102L8.162 395.378c-10.883 18.85-10.883 41.356 0 60.205 10.883 18.849 30.373 30.102 52.139 30.102h391.398c21.765 0 41.256-11.254 52.14-30.101 10.883-18.85 10.883-41.356 0-60.205zm-25.978 45.207c-5.461 9.458-15.241 15.104-26.162 15.104H60.301c-10.922 0-20.702-5.646-26.162-15.104-5.46-9.458-5.46-20.75 0-30.208L229.84 71.416c5.46-9.458 15.24-15.104 26.161-15.104 10.92 0 20.701 5.646 26.161 15.104l195.7 338.962c5.459 9.458 5.459 20.75-.001 30.208z" />
                    <path d="M241.001 176.01h29.996v149.982h-29.996zM256 355.99c-11.027 0-19.998 8.971-19.998 19.998s8.971 19.998 19.998 19.998c11.026 0 19.998-8.971 19.998-19.998S267.027 355.99 256 355.99z" />
                </svg>
            </button>
            {cid && <p className="CutchaId">{cid}</p>}
            <button className="btn submit" title="Submit your solution" onClick={onSubmit}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={200}
                    viewBox="-0.5 -0.5 565 558"
                    className="icon"
                >
                    <g className="icon" strokeMiterlimit={10}>
                        <path d="M295 188l131 90-131 90z" strokeWidth={34} pointerEvents="all" />
                        <path
                            d="M65 278h230"
                            fill="none"
                            strokeWidth={130}
                            pointerEvents="stroke"
                        />
                        <path
                            d="M145 158V35.5Q145 18 162.5 18h365Q545 18 545 35.5v485q0 17.5-17.5 17.5h-365q-17.5 0-17.5-17.5V398"
                            fill="none"
                            strokeWidth={37}
                            pointerEvents="stroke"
                        />
                    </g>
                </svg>
            </button>
        </div>
    );
}

export default CutchaHeader;
