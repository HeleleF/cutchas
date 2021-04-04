export const getPuzzleStats = async (): Promise<unknown> => {
    try {
        const resp = await fetch('/api/stats');
        const data = await resp.json();

        return data.result;
    } catch (err) {
        return { error: err.message };
    }
};
