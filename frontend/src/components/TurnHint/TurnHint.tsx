import './TurnHint.css';

// taken from https://codepen.io/fabiowallner/pen/YOyJbJ

export default function TurnHint(): JSX.Element {
    return (
        <div className="TurnDevice">
            <div className="Phone"></div>
            <div className="TurnMessage">Please turn your device</div>
        </div>
    );
}
