export interface CutchaPuzzle {
    succ: boolean;
    captcha_question: string;
    captcha_token: string;
}

export interface PuzzleSolution {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export type CutchaApiResult = CutchaPuzzle | string;

export interface CutchaPuzzleSuccess {
    succ: true;
    correct: boolean;
}

export interface CutchaPuzzleNoSuccess {
    succ: false;
    err: 'captcha_token is invalid or expired';
}

export type CutchaPuzzleSubmitResult =
    | CutchaPuzzleSuccess
    | CutchaPuzzleNoSuccess
    | 'captcha_token is missing';

export type CutchaPart = 'cut' | 'part0' | 'part1' | 'part2';
