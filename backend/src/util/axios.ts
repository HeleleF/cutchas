import axios from 'axios';
import { SECRETS } from './secrets';

const axiosInstance = axios.create({
    headers: {
        Origin: 'https://cutcaptcha.com',
        Referer: `${SECRETS.CUTCHA_API_URL}.html`,
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json; charset=UTF-8',
    },
    timeout: 10000,
});

export default axiosInstance;
