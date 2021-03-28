import React from 'react';

import { render, screen } from '@testing-library/react';
import PuzzlePiece from '../components/PuzzlePiece/PuzzlePiece';

test('render piece', async () => {
    const drag = jest.fn();
    render(<PuzzlePiece id={'ABCDEF'} scaleFactor={2} partNumber={0} onDragEnd={drag} />);

    const pElement = screen.getByTitle('Puzzle Piece 1');
    expect(pElement).toBeInTheDocument();
});

test('render piece with image src', async () => {
    const drag = jest.fn();
    render(<PuzzlePiece id={'ABCDEF'} scaleFactor={2} partNumber={0} onDragEnd={drag} />);

    const iElement = screen.getByRole('img') as HTMLImageElement;
    expect(iElement).toBeInTheDocument();
    expect(iElement.src).toContain('/ABCDEF/part0');
});
