import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import './App.css';
import Cutcha from './components/Cutcha/Cutcha';
import CutchaStats from './components/CutchaStats/CutchaStats';
import TurnHint from './components/TurnHint/TurnHint';
import useMediaQuery from './hooks/useMediaQuery';

function App(): JSX.Element {
    const isPortrait = useMediaQuery();

    return (
        <div className="App">
            {isPortrait ? (
                <TurnHint />
            ) : (
                <>
                    <Cutcha />
                    <CutchaStats />
                    <ToastContainer />
                </>
            )}
        </div>
    );
}

export default App;
