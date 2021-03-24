export interface CutchaPuzzle {
  succ: boolean;
  captcha_question: string;
  captcha_token: string;
}

export interface CutchaPuzzleSuccess {
  succ: true;
  correct: boolean;
}

export interface CutchaPuzzleNoSuccess {
  succ: false;
  err: "captcha_token is invalid or expired";
}

export type CutchaPuzzleSubmitResult =
  | CutchaPuzzleSuccess
  | CutchaPuzzleNoSuccess
  | "captcha_token is missing";
