import './GithubRibbon.css';

import React from 'react';

function GithubRibbon(): JSX.Element {
    return (
        <a
            href="https://github.com/HeleleF/cutchas"
            className="GithubRibbon"
            data-ribbon="Fork me on GitHub"
            title="Fork me on GitHub"
        >
            Fork me on GitHub
        </a>
    );
}

export default GithubRibbon;
