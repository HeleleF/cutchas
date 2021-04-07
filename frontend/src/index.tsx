import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import GithubRibbon from './components/GithubRibbon/GithubRibbon';
import './index.css';

ReactDOM.render(
    <React.StrictMode>
        <GithubRibbon />
        <App />
    </React.StrictMode>,
    document.getElementById('root'),
);
