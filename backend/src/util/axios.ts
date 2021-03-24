import axios from "axios";

const axiosInstance = axios.create({
  headers: {
    Origin: "https://cutcaptcha.com",
    Referer: "https://cutcaptcha.com/captcha/SAs61IAI.html",
    "User-Agent": "Mozilla/5.0",
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json; charset=UTF-8",
  },
  timeout: 10000,
});

export default axiosInstance;
