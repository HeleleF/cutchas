import {
    CutchaApiResult,
    CutchaPart,
    CutchaPuzzle,
    CutchaPuzzleSubmitResult,
    PuzzleSolution,
} from '../types/cutcha';
import axiosInstance from './axios.js';
import { SECRETS } from './secrets.js';

export const CUTCHA_SUBMIT_PAYLOAD = {
    f: '',
    i: '4256A7a1XEiEL72IUdPL97ei7EuEEAuu',
    ip: 0,
    papi:
        'ObSji8QE5hJIU947p50ySuF3isUIO4KswlERKBm/oLgbFujikI1G0dg04SJWCcs5f73VHChCnS+DbMuG5fudZUVBiQkDLq8vb3L/dHY8QacOSQSr6raGu8CaiQvBxwithYvYDiqUwiL+e2CeC5EF85kb4upaLJXTuJ8kUm/tZeZSQIoaeHelLjk4QNXhtt/WRS/0agKvytpoehx444gMz3R9EUhXbUk+PNrsazYDqmlIShMDq+6M+xBarz2PMtL5f8Vv7YYvuvoNPOizPtmmKht9ST+AVEJe/kY5B0GC7b+QEX3VFgR5vpGBQHt9ohw4SyCVAkX4I56wt2NdcaeO/7PjkZNtZrqO4hhs6SYZjc7pa2mj786V7A==',
};

/**
 * Loads the puzzle piece image specified by `partName`
 * for the cutcha puzzle with the given `id`.
 *
 * Throws an error if the image is missing or corrupted.
 *
 * Returns the image data as a base64-encoded data-uri.
 */
export const loadPuzzleImage = async (
    id: string,
    partName: CutchaPart,
): Promise<string> => {
    const imageUrl = `${SECRETS.CUTCHA_API_URL}/${SECRETS.CUTCHA_API_KEY}/${id}/${partName}.png`;

    const { data } = await axiosInstance.get<ArrayBuffer>(imageUrl, {
        responseType: 'arraybuffer',
    });
    if (data.byteLength < 1000) {
        console.log(`Recieved only ${data.byteLength} bytes from\n${imageUrl}`);
        throw new TypeError('Empty part');
    }
    return `data:image/png;base64,${Buffer.from(data).toString('base64')}`;
};

/**
 * Tries to load all puzzle pieces for the cutcha puzzle with the given `id`.
 *
 * Returns the image data for all parts as base64-encoded data-uri's
 * or `null` if at least one part failed to load.
 */
export const loadParts = async (id: string): Promise<string[] | null> => {
    try {
        return await Promise.all([
            loadPuzzleImage(id, 'cut'),
            loadPuzzleImage(id, 'part0'),
            loadPuzzleImage(id, 'part1'),
            loadPuzzleImage(id, 'part2'),
        ]);
    } catch (_) {
        return null;
    }
};

/**
 * Requests a new cutcha puzzle.
 *
 * Returns a new puzzle (consisting of an ID and a token) or `null`.
 */
export const requestNewCutcha = async (): Promise<CutchaPuzzle | null> => {
    const { data } = await axiosInstance.post<CutchaApiResult>(
        `${SECRETS.CUTCHA_API_URL}/${SECRETS.CUTCHA_API_KEY}.json`,
        {
            api_key: SECRETS.CUTCHA_API_KEY,
        },
    );

    if ('string' === typeof data) {
        console.log(`Expected json, but recieved ${data}`);
        return null;
    }

    if (!data.succ) {
        console.log(data);
        return null;
    }

    return data;
};

/**
 * Validates a cutcha token by submitting its puzzle solution.
 *
 * Returns whether the token was successfully validated or not.
 */
export const validateCutcha = async (
    captcha_token: string,
    { x0, x1, x2, y0, y1, y2 }: PuzzleSolution,
): Promise<boolean> => {
    const { data } = await axiosInstance.post<CutchaPuzzleSubmitResult>(
        `${SECRETS.CUTCHA_API_URL}/${SECRETS.CUTCHA_API_KEY}/check`,
        {
            ...CUTCHA_SUBMIT_PAYLOAD,
            captcha_token,
            solution: [
                [x0, y0, 0],
                [x1, y1, 0],
                [x2, y2, 0],
            ],
        },
    );

    if ('string' === typeof data) {
        console.log(data);
        return false;
    }

    if (!data.succ) {
        console.log(data.err);
        return false;
    }

    if (!data.correct) {
        console.log('not correct');
        return false;
    }
    return true;
};
