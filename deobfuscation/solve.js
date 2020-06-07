

const check = async (tok, x0, y0, x1, y1, x2, y2) => {

    const data = {
        captcha_token: tok,
        f: '',
        i: '4256A7a1XEiEL72IUdPL97ei7EuEEAuu',
        ip: 0,
        papi: 'ObSji8QE5hJIU947p50ySuF3isUIO4KswlERKBm/oLgbFujikI1G0dg04SJWCcs5f73VHChCnS+DbMuG5fudZUVBiQkDLq8vb3L/dHY8QacOSQSr6raGu8CaiQvBxwithYvYDiqUwiL+e2CeC5EF85kb4upaLJXTuJ8kUm/tZeZSQIoaeHelLjk4QNXhtt/WRS/0agKvytpoehx444gMz3R9EUhXbUk+PNrsazYDqmlIShMDq+6M+xBarz2PMtL5f8Vv7YYvuvoNPOizPtmmKht9ST+AVEJe/kY5B0GC7b+QEX3VFgR5vpGBQHt9ohw4SyCVAkX4I56wt2NdcaeO/7PjkZNtZrqO4hhs6SYZjc7pa2mj786V7A==',
        solution: [ [ x0, y0, 0 ], [ x1, y1, 0 ], [ x2, y2, 0 ] ],
    };

    try {
        const r = await fetch("https://cutcaptcha.com/captcha/SAs61IAI/check", {
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify(data),
            method: "POST",
        }).then(e => e.json());
    
        return r?.succ && r?.correct;
    } catch (_) {
        return false;
    }
};
