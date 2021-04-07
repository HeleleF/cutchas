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

export type PuzzleDataAll = PuzzleData & {
    images: [string, string, string, string];
};

export interface PuzzleTypeCount {
    _id: string;
    typCount: number;
}

export type PuzzleSubmitData = PuzzleData & PuzzleSolution;
