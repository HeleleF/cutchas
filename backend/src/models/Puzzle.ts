import mongoose from 'mongoose';

export type PuzzleTyp = 'broken' | 'solved' | 'unknown';

export type PuzzleDocument = mongoose.Document & {
    question: string;

    typ: PuzzleTyp;

    x0: number;
    y0: number;

    x1: number;
    y1: number;

    x2: number;
    y2: number;
};

const puzzleSchema = new mongoose.Schema<PuzzleDocument>(
    {
        question: {
            type: String,
            unique: true,
            required: true,
            validate: {
                validator(value: string) {
                    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
                        value,
                    );
                },
                message({ value }: { value: unknown }) {
                    return `${value} is not a valid question uuid!`;
                },
            },
        },
        typ: {
            type: String,
            enum: ['broken', 'solved', 'unknown'],
            required: true,
        },

        x0: {
            type: Number,
            required: false,
            min: 1,
            max: 488,
        },
        y0: {
            type: Number,
            required: false,
            min: 1,
            max: 488,
        },

        x1: {
            type: Number,
            required: false,
            min: 1,
            max: 488,
        },
        y1: {
            type: Number,
            required: false,
            min: 1,
            max: 488,
        },

        x2: {
            type: Number,
            required: false,
            min: 1,
            max: 488,
        },
        y2: {
            type: Number,
            required: false,
            min: 1,
            max: 488,
        },
    },
    { timestamps: true },
);

export const Puzzle = mongoose.model<PuzzleDocument>('Puzzle', puzzleSchema);
