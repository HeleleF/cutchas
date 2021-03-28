import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
    rest.get('/api/puzzle/new', (req, res, ctx) => {
        return res(ctx.json({ token: 'aaa', id: '000' }));
    }),
    rest.get('/api/stats/', (req, res, ctx) => {
        return res(ctx.json({ result: [] }));
    }),
);

beforeAll(() =>
    server.listen({
        onUnhandledRequest: 'warn',
    }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders loading paragraph', () => {
    render(<App />);

    const pElement = screen.getByText(/Loading.../i);
    expect(pElement).toBeInTheDocument();
});

describe('requests a new puzzle on load', () => {
    it('renders four images', async () => {
        render(<App />);

        await waitFor(() => screen.getAllByRole('img'));

        const imgElement = screen.getAllByRole('img');
        expect(imgElement).toHaveLength(4);
    });

    it('renders puzzle id', async () => {
        render(<App />);

        await waitFor(() => screen.getByText('000'));

        const pElement = screen.getByText('000');
        expect(pElement).toBeInTheDocument();
    });
});

describe('stats', () => {
    it('gets stats when app renders', async () => {
        server.use(
            rest.get('/api/stats/', (req, res, ctx) => {
                return res(ctx.json({ result: [{ _id: 'solved', typCount: 87 }] }));
            }),
        );

        render(<App />);

        await waitFor(() => screen.getByText('87 solved'));

        const dElement = screen.getByTitle('Updated every minute');

        expect(dElement.firstChild).not.toBeNull();
        expect(dElement.firstChild?.textContent).toEqual('87 solved');
    });
});
