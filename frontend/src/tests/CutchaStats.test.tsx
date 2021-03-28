import React from 'react';

import { render, screen } from '@testing-library/react';
import CutchaStats from '../components/CutchaStats/CutchaStats';

test('render stats without content', async () => {
    render(<CutchaStats stats={[]} />);

    const pElement = screen.getByTitle('Updated every minute');
    expect(pElement).toBeInTheDocument();
    expect(pElement).toBeEmptyDOMElement();
});

test('render stats with some content', async () => {
    render(<CutchaStats stats={[{ _id: 'solved', typCount: 19 }]} />);

    const dElement = screen.getByTitle('Updated every minute');
    expect(dElement).toBeInTheDocument();
    expect(dElement).not.toBeEmptyDOMElement();

    const pElement = screen.getByText('19 solved');
    expect(pElement).toBeInTheDocument();
});

test('render stats with full content', async () => {
    render(
        <CutchaStats
            stats={[
                { _id: 'solved', typCount: 10 },
                { _id: 'broken', typCount: 31 },
                { _id: 'unknown', typCount: 99 },
            ]}
        />,
    );

    const dElement = screen.getByTitle('Updated every minute');
    expect(dElement).toBeInTheDocument();
    expect(dElement).not.toBeEmptyDOMElement();

    const pElement1 = dElement.firstChild;
    expect(pElement1).not.toBeNull();
    expect(pElement1?.textContent).toEqual('10 solved');

    const pElement2 = pElement1?.nextSibling;
    expect(pElement2).not.toBeNull();
    expect(pElement2?.textContent).toEqual('31 broken');

    const pElement3 = pElement2?.nextSibling;
    expect(pElement3).not.toBeNull();
    expect(pElement3?.textContent).toEqual('99 unknown');
});
