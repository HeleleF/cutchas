export interface PuzzleSolution {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface PuzzleData {
    id: string | null;
    token: string | null;
}

export interface PuzzleStats {
    result?: unknown[];
}

export type PuzzleSubmitData = PuzzleData & PuzzleSolution;
