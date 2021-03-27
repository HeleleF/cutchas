export interface PuzzleSolution {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface PuzzleData {
    id: string;
    token: string;
}

export interface PuzzleTypeCount {
    _id: string;
    typCount: number;
}

export type PuzzleSubmitData = PuzzleData & PuzzleSolution;

export interface PuzzleDataLoading {
    puzzle: null;
    loading: true;
}

export interface PuzzleDataDone {
    puzzle: PuzzleData;
    loading: false;
}

export type PuzzleDataRequest = PuzzleDataLoading | PuzzleDataDone;
