import './App.css';
import Cutcha from './components/Cutcha/Cutcha';
import CutchaStats from './components/CutchaStats/CutchaStats';

function App(): JSX.Element {
    return (
        <div className="App">
            <Cutcha />
            <div className="TurnDevice">
                {window.innerWidth} {window.innerHeight}
            </div>
            <CutchaStats />
        </div>
    );
}

export default App;
