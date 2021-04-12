import axios from 'axios';
import { CutchaPart } from '../types/cutcha.js';
import { SECRETS } from './secrets.js';

const axiosInstance = axios.create({
    headers: {
        Origin: 'https://cutcaptcha.com',
        Referer: `${SECRETS.CUTCHA_API_URL}/${SECRETS.CUTCHA_API_KEY}.html`,
        'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 OPR/74.0.3911.232',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json; charset=UTF-8',
    },
    timeout: 10000,
});

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

export default axiosInstance;
