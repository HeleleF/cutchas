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
                    viewBox="0 0 512 512.1"
                    width="269"
                    height="269"
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
                    viewBox="0 0 338.352 338.352"
                    width="269"
                    height="269"
                    className="icon"
                >
                    <path d="M169.176 0C75.601 0 0 75.514 0 169.176s75.514 169.176 169.176 169.176 169.176-75.514 169.176-169.176S262.752 0 169.176 0zm0 315.731c-81.191 0-146.556-65.365-146.556-146.556S87.986 22.619 169.176 22.619s146.556 65.365 146.556 146.556-65.365 146.556-146.556 146.556z" />
                    <path d="M231.187 162.382l-74.396-74.396c-4.472-4.472-11.267-4.472-15.825 0-4.472 4.472-4.472 11.267 0 15.826l65.365 65.365-65.365 65.365c-4.472 4.472-4.472 11.267 0 15.825 2.236 2.236 4.472 3.354 7.913 3.354 2.236 0 5.677-1.118 9.03-2.236l73.278-73.278c2.236-2.236 3.355-4.472 3.355-7.913 0-3.354-1.118-5.676-3.355-7.912z" />
                </svg>
            </button>
        </div>
    );
}

export default CutchaHeader;
