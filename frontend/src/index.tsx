import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import GithubRibbon from './components/GithubRibbon/GithubRibbon';

ReactDOM.render(
    <React.StrictMode>
        <GithubRibbon />
        <App />
    </React.StrictMode>,
    document.getElementById('root'),
);
