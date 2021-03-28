import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import CutchaHeader from '../components/CutchaHeader/CutchaHeader';

test('render header without id', async () => {
    const report = jest.fn();
    const submit = jest.fn();

    render(<CutchaHeader onReport={report} onSubmit={submit} />);

    const btnElements = screen.getAllByRole('button');
    expect(btnElements).toHaveLength(2);

    expect(report).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
});

test('render header with id', async () => {
    const report = jest.fn();
    const submit = jest.fn();

    render(<CutchaHeader cid={'ABCDEF'} onReport={report} onSubmit={submit} />);

    const pElement = screen.getByText('ABCDEF');
    expect(pElement).toBeInTheDocument();

    expect(report).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
});

test('click report', async () => {
    const report = jest.fn();
    const submit = jest.fn();

    render(<CutchaHeader onReport={report} onSubmit={submit} />);

    fireEvent.click(screen.getByTitle('Report this puzzle as broken'));

    expect(report).toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
});

test('click submit', async () => {
    const report = jest.fn();
    const submit = jest.fn();

    render(<CutchaHeader onReport={report} onSubmit={submit} />);

    fireEvent.click(screen.getByTitle('Submit your solution'));

    expect(report).not.toHaveBeenCalled();
    expect(submit).toHaveBeenCalled();
});
