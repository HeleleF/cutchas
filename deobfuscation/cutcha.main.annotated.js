(() => {

    const apiKey = 'SAs61IAI';
    const secretKey = 'gpMceXVajgsEE4uIE5I1EaUewBeu75Au';
    let unused = 'a77b59bbead40054aec78b0aa2474391b0e27b2a';

    const curScr = document.currentScript || {
        'src': "https://www.bullads.net"
    };

    let scheme = 'https';
    let domain = curScr.src.match(/(www.)?([a-zA-Z0-9-_]+)\.([a-zA-Z0-9]+)/)[0];

    if (curScr.src.indexOf('localhost') > -1) {
        domain = "localhost:" + location.port;
        scheme = 'http';
    }

    const disallowOrigin = function () {

        let failed = 0;

        if (Array.from(document['getElementsByTagName']('link')).filter(function (li) {
            return li.href['indexOf']("userAgent") > -1 && li['href']['indexOf']("style.css") > -1;
        }).length > 0) {
            failed = 1;
        }
        if (window.location.href.toString().indexOf("9kw.eu") > -1) { // and other captcha solving sites
            failed = 1;
        }
        if (!localStorage.getItem('dd_dev')) {
            if (window.location['hostname']['indexOf']('localhost') > -1) {
                failed = 1;
            }
            if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/[getValue('0x35')](window['location'][getValue('0x24')])) {
                failed = 1;
            }
        }
        try {
            if (typeof window.capResponseCallback == 'function') {
                if (window.capResponseCallback.toString().indexOf('xhr') > -1) {
                    failed = 1;
                }
            }
        } catch (_) { }
        if (typeof window.closeWindowOrTab == 'function') {
            failed = 1;
        }
        return failed;
    };

    let frameHeight = 291;
    let frameWidth = 487;

    const detectHumanBehaviour = function () {

        var AUTH = {
            tests: {},
            isBot: true,
            isUser: false,
            onUser(callback) {
                AUTH.isUser ? callback.call(AUTH) : functions.push(callback);
            }
        };
        const functions = [];
        var OBJ = {};

        var addHandler = function (elm, type, handler) {
            elm.addEventListener ? elm.addEventListener(type, handler, false) : elm.attachEvent && elm.attachEvent('on' + type, handler);
        };
        var removeHandler = function (elm, type, func) {
            if (document.removeEventListener)
                elm.removeEventListener && elm['removeEventListener'](type, func, false);
            else {
                var ontype = 'on' + type;
                elm['detachEvent'] && ((undefined === elm[ontype]) && (elm[ontype] = null), elem.detachEvent(ontype, func));
            }
        };

        function setUser() {

            var idx = 0;

            for (var prop in OBJ)
                OBJ.hasOwnProperty(prop) && (AUTH.tests[prop] = (true=== OBJ[prop]), (true === OBJ[prop]) && idx++);
            
            AUTH.isUser = idx > 0;
            AUTH.isBot = !AUTH.isUser;

            if (AUTH.isUser) {
                for (; functions.length;) {
                    functions.shift().call(AUTH);
                }
            }
        };

        OBJ.scroll = function () {

            var onScroll = function () {
                OBJ.scroll = true;
                setUser();
                removeHandler(window, 'scroll', onScroll);
                removeHandler(document, 'scroll', onScroll);
            };

            addHandler(document, 'scroll', onScroll);
            addHandler(window, 'scroll', onScroll);
        };

        OBJ.mouse = function () {
            var onMouse = function () {
                OBJ.mouse = true;
                setUser();
                removeHandler(window, "mousemove", onMouse);
            };
            addHandler(window, "mousemove", onMouse);
        };

        OBJ.mousedown = function () {
            var onDown = function () {
                OBJ.mousedown = true;
                setUser();
                removeHandler(window, "mousedown", onDown);
            };
            addHandler(window, "mousedown", onDown);
        };

        OBJ.mouseup = function () {
            var onUp = function () {
                OBJ.mouseup = true;
                setUser();
                removeHandler(window, 'mouseup', onUp);
            };
            addHandler(window, 'mouseup', onUp);
        };

        OBJ.key = function () {

            var onKey = function () {
                OBJ.key = true;
                setUser();
                removeHandler(window, 'key', onKey);
            };
            addHandler(window, 'key', onKey);
        };

        (function () {

            // start endless loop if beautfier was detected
            var _0x314e64 = function () {

                var _0x57ade5 = function (_0x180eaf) {
                    var _0x56cc4f = ~-0x1 >> 0x1 + 0xff % 0x0;
                    if (_0x180eaf['indexOf']('i' === _0x56cc4f)) {
                        _0x1a4c25(_0x180eaf);
                    }
                };
                var _0x1a4c25 = function (_0x208cd1) {
                    var _0x84ddf8 = ~-0x4 >> 0x1 + 0xff % 0x0;
                    if (_0x208cd1['indexOf']((true + '')[0x3]) !== _0x84ddf8) {
                        _0x57ade5(_0x208cd1);
                    }
                };
                if (!_0x481720()) {
                    if (!_0x403e92()) {
                        _0x57ade5('ind\x65xOf');
                    } else {
                        _0x57ade5('ind\u0435xOf');
                    }
                } else {
                    _0x57ade5('ind\u0435xOf');
                }
            };
            _0x314e64();

            for (var prop in OBJ)
                OBJ['hasOwnProperty'](prop) && OBJ[prop]['call']();

            setUser();
        })();

        return AUTH.onUser;
    
    }();

    const startTime = Date.now();
    let localFlag = false;

    try {
        localFlag = localStorage.getItem('$R');
        if (!localFlag) {
            localFlag = Math.ceil(Math.random() * 1e14).toString(32);
            localStorage.setItem('$R', localFlag);
        }
    } catch (_) { }

    const generateUID = function generateUID() {
        return Number(Math.random()).toString(33).split('.')[1];
    };

    const guid = generateUID();

    window.addEventListener('message', function CapMessageListener(msgEvent) {

        if (msgEvent['origin'] !== scheme + "://" + domain)
            return;

        if (msgEvent['data'].substr(0, 1) == '{' && msgEvent.data.substr(-1) == '}') {
            return handleMsgData(msgEvent.data, msgEvent);
        }

        this.document.getElementById('cap_token')['value'] = msgEvent.data;

        if (typeof window.capResponseCallback == 'function') {
            window.capResponseCallback(msgEvent['data']);
        }
    });

    const handleMsgData = function (jsonStr, msgEv) {

        const r = JSON.parse(jsonStr);

        switch (r.cmd) {

            case 'tlh':
                msgEv.source.postMessage(JSON['stringify']({
                    'cmd': "tlh:response",
                    'payload': [top.location.href]
                }), msgEv.origin);
                break;

            case 'ping':
                msgEv.source.postMessage(JSON['stringify']({
                    'cmd': 'pong',
                    'payload': [Date.now()]
                }), msgEv.origin);
                break;
        }
    };

    document.addEventListener("DOMContentLoaded", function CapDomContentLoaded() {

        const div = document.getElementById("puzzle-captcha");

        div.innerHTML = '';

        if (disallowOrigin()) {
            div.innerHTML = "origin not allowed.";
            return false;
        }

        const isMobile = /mobileregex/i.test(navigator.userAgent);

        if (isMobile || location['hash'].indexOf("forceMobile=true") > -1 || div['outerHTML'].toString().indexOf('aria-style="mobile"') > -1) {
            frameHeight = 0x14a;
            frameWidth = 0x172;
            isMobile = true;
        }

        const frame = document['createElement']('iframe');

        frame.style.border = "none";
        frame.style.overflow = 'hidden';
        frame['name'] = guid;
        frame['id'] = guid;
        frame.style['height'] = frameHeight + 'px';
        frame.style.width = frameWidth + 'px';
        frame.style.display = 'block';
        document.getElementById("puzzle-captcha").appendChild(frame);

        const payload = {
            'api_key': apiKey,
            'r': localFlag,
            'c': Date.now(),
            'l': startTime,
            'r': document['location'].hostname,
            'i': secretKey,
            'sh': (parseInt(frame['style'].height) / 0x14c),
            'sw': (parseInt(frame.style.width) / 0x1e8),
            'm': isMobile
        };
        const params = ["api_key", 'r', 'c', 'l', 'r', 'i', 'sh', 'sw', 'm'];

        const addParams = function (wrap) {

            params.forEach(p => {

                const inp = document.createElement("input");
                inp.type = 'hidden';
                inp.name = p;
                inp.value = payload[p];
                wrap.appendChild(inp);
            });
        };

        const uuid = generateUID();

        const form = document.createElement('form');

        form.action = `${scheme}://${domain}/captcha/${apiKey}.html`;
        form.method = "POST";
        form.target = guid;
        form['id'] = uuid;
        addParams(form);
        document.getElementById("puzzle-captcha").appendChild(form);
        document.getElementById(uuid).submit();
        document.getElementById(uuid).remove();

        if (!document['getElementById']("cap_token")) {
            const input = document.createElement('input');
            input.id = "cap_token";
            input.type = 'hidden';
            input.value = '';
            input.name = "cap_token";
            document.getElementById("puzzle-captcha").appendChild(input);
        }

        detectHumanBehaviour(function () {
            frame.contentWindow.postMessage(JSON.stringify({
                'cmd': 'iA',
                'payload': [true]
            }), '*');
        });
    });
})();