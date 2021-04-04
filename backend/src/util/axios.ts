import axios from 'axios';
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

export default axiosInstance;
