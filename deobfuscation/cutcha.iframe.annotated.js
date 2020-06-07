(() => {

    const mobile = /mobileregex/i.test(navigator.userAgent);

    const scriptStartedTime = Date.now();
    let puzzleLoadingTime = 0;
    let newCaptchasLoadedCount = 0;
    let partCounter = 0;

    function onLoad() {

        const publicKey = $("#capBody").data('pubk');

        /** ##########################################################################
          * ######################## IFRAME DETECTION ################################
          * ##########################################################################
          */
        const opts = sandblaster.detect();
        if ('sandboxed' in opts && opts.sandboxed || 'framed' in opts && !opts.framed) {
            $("#capBody").html("direct access is not allowed");
            return;
        }
        if (window.top === window.self) {
            $("#capBody").html("direct access is not allowed");
            return;
        }

        const noop = () => { };

        /**
         * creates function and returns it
         * for one-time use
         * @param {Function} func A function
         */
        function runOnce(func, gU) {

            var retVal;

            return function () {

                if (func) {
                    retVal = func.apply(gU || this, arguments);
                    func = noop;
                }
                return retVal;
            };
        }

        /** ##########################################################################
          * ######################## ENCRYPTION ######################################
          * ##########################################################################
          */

        /**
         * Hashes `str` with *FNV-1 (32bit)*
         * 
         * see (http://www.isthe.com/chongo/tech/comp/fnv/)
         * @param {string} str 
         */
        const fnvHash = function (str) {

            let seed = 2166136261;
            const len = str.length;

            for (let idx = 0; idx < len; ++idx) {
                seed ^= str.charCodeAt(idx);
                seed += (((seed << 1) + (seed << 4)) + (seed << 7) + (seed << 8)) + (seed << 24);
            }

            return seed >>> 0;
        };

        /**
         * Encrypts `secret` with Corrected Block TEA (xxtea) algorithm.
         * The password is the *i* Parameter with underscore prepended.
         * @param {string} secret 
         */
        const buildPapiKey = function (secret) {

            /**
             * Turn string into array by converting 4 chars of str
             * into a 32 bit unsigned integer.
             * 
             * Result array has length `str.length / 4`
             * @param {string} str String with length as multiple of 4
             */
            var str2longs = function (str) {

                const arr = [];

                for (let i = 0; i < Math.ceil(str.length / 4); i++) {
                    arr[i] = str.charCodeAt(4 * i) + str.charCodeAt(4 * i + 1) << 8 + str.charCodeAt(4 * i + 2) << 16 + str.charCodeAt(4 * i + 3) << 24;
                }
                return arr;
            };

            /**
             * Turn array to string by converting each integer of nums
             * into a 4-char string.
             * 
             * Resultstring has length `nums.length * 4`
             * @param {number[]} nums Array of 32 bit unsigned Integers
             */
            var longs2str = function (nums) {

                const arr = new Array(nums.length);

                for (let i = 0; i < nums.length; i++) {
                    const val = nums[i];
                    arr[i] = String.fromCharCode(255 & val, (val >>> 8) & 255, (val >>> 16) & 255, (val >>> 24) & 255);
                }
                return arr.join('');
            };

            /**
             * Encrypts text using Corrected Block TEA (xxtea) algorithm.
             *
             * @param   {string} plaintext - String to be encrypted (multi-byte safe).
             * @param   {string} key - Password to be used for encryption (1st 16 chars).
             * @returns {string} Encrypted text (encoded as base64).
             */
            var encrypt = function (plaintext, password) {

                if (0 === plaintext.length) return '';

                // v is n-word data vector; converted to array of longs from UTF-8 string
                let v = str2longs(plaintext);

                // k is 4-word key; simply convert first 16 chars of password as key
                const k = str2longs(password.slice(0, 16));
                const n = v.length;
                let z = v[n - 1];
                let y = v[0];
                let sum = 0;

                for (let idx = Math.floor(6 + 52 / n); idx-- > 0;) {

                    sum += 0x9E3779B9;

                    const e = (sum >>> 2) & 3;

                    for (let j = 0; j < n; j++) {

                        y = v[(j + 1) % n];
                        const mx = (((z >>> 5) ^ (y << 2)) + ((y >>> 3) ^ (z << 4))) ^ ((sum ^ y) + (k[(3 & j) ^ e] ^ z));
                        z = v[j] += mx;
                    }
                }

                // convert array of longs to string and base64 encode for "transport"
                return btoa(longs2str(v));
            };

            /**
             * Encode multi-byte Unicode string into utf-8 multiple single-byte characters
             *
             * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
             *
             * @param {string} str Unicode string to be encoded as UTF-8
             */
            var toUnicode = function (str) {

                var hr = str.toString().replace(/[\u0080-\u07ff]/g, function (match) {

                    const code = match.charCodeAt(0);
                    return String.fromCharCode(192 | (code >> 6), 128 | (63 & code));
                });

                hr = hr.replace(/[\u0800-\uffff]/g, function (match) {

                    const code = match.charCodeAt(0);
                    return String.fromCharCode((224 | (code >> 12)), 128 | (code >> 6) & 63, (128 | (63 & code)));
                });

                return hr;
            };

            const iKey = `_${$('#capBody').data('i')}`;

            return encrypt(toUnicode(secret), toUnicode(iKey));
        };
        /**
        * if recieved message contains cmd=iA, set this to 1
        */
        let recievedIA = 0;
        let runtimeFlag = 0;
        let iH = 0;

        // detect human behaviour, not used
        var iI = function () {

            var AUTH = {
                tests: {},
                isBot: true,
                isUser: false,
                onUser(callback) {
                    AUTH.isUser ? callback.call(AUTH) : functions.push(callback);
                }
            };
            var functions = [];
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
                    OBJ.hasOwnProperty(prop) && (AUTH.tests[prop] = (true === OBJ[prop]), (true === OBJ[prop]) && idx++);

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
                for (var prop in OBJ) OBJ.hasOwnProperty(prop) && OBJ.prop.call();
                setUser();
            })();

            return AUTH.onUser;

        }();

        runtimeFlag = 1;

        /**
         * performs GET req to given url and returns promise
         * @param {String} url 
         * @param {Function} callback
         * @returns {Promise<string>}
         */
        function loadBlob(url, callback) {
            return new Promise(function (resolve, reject) {

                var xhr = new XMLHttpRequest();
                var called = false;
                xhr.open('GET', url, true);
                xhr.responseType = "arraybuffer";

                xhr.onprogress = function (ev) {
                    if (ev.lengthComputable) {
                        callback(parseInt(ev.loaded / ev.total * 100));
                    } else {
                        if (!called) {
                            called = true;
                            callback(-1);
                        }
                    }
                };
                xhr.onloadend = function () {

                    if (!xhr.status.toString().match(/^2/)) {
                        reject(xhr);

                    } else {

                        if (!called) {
                            callback(100);
                        }
                        var options = {};
                        var headers = xhr.getAllResponseHeaders();
                        var match = headers.match(/^Content-Type:\s*(.*?)$/im);
                        if (match && match[1]) {
                            options.type = match[1];
                        }
                        var blob = new Blob([this.response], options);
                        resolve(URL.createObjectURL(blob));
                    }
                };
                xhr.send();
            });
        }

        /** ##########################################################################
          * ######################## IFRAME COMMUNICATION ############################
          * ##########################################################################
          */

        /**
        * handles messages from top window
        */
        window.onmessage = function (ev) {
            var r = JSON.parse(ev.data);
            switch (r.cmd) {
                case 'pong':
                    window.lastPong = r.payload[0];
                    break;
                case "tlh:response":
                    window.tlh = r.payload[0];
                    tlhResponseTime = Date.now();
                    break;
                case 'iA':
                    recievedIA = 1;
                    break;
            }
        };

        /**
         * posts message to top window
         * @param {string} command Command
         * @param {any=} data Payload, optional
         */
        const postMsg = function postMsg(command, data) {
            window.top.postMessage(JSON.stringify({
                "cmd": command,
                "payload": [data || ""]
            }), "*");
        };
        const startTime = Date.now();
        let tlhResponseTime = 0;

        postMsg('tlh');

        let numberOfSentPings = 1;

        /**
           * check every second for response from other window
           */
        const pingPongIntervalID = setInterval(function () {
            ++numberOfSentPings;
            postMsg("ping");

            // more than 3 seocnds passed and no response?
            if (!("tlh" in window) && Date.now() - startTime > 3000) {

                $("#captchaImage, #partarea").hide();
                $("#msgContainer").show();
                $(".false").show();
                clearInterval(rlI);
                clearInterval(pingPongIntervalID);
            }
        }, 999);

        postMsg('ping');

        window.scaleFactor = $("#cutcha").hasClass('desk') ? Math.min(1, ($(window).height() - 41) / 332) : Math.min(1, ($(window).height() - 116) / 332);
        window.invertedScaleFactor = 1 - window.scaleFactor;

        /** ##########################################################################
          * ######################## INIT PACE FRAMEWORK #############################
          * ##########################################################################
          */

        let paceStartTime = 0;

        Pace.on('start', function () {
            paceStartTime = Date.now();
            $("#captchaImage, #part0, #part1, #part2").hide();
        });
        Pace.on('done', function () {

            puzzleLoadingTime = Date.now() - paceStartTime;

            $("#part0, #part1, #part2").show();
            $("#captchaImage").css('display', 'block');

            try {
                window.scaleFactor = $("#cutcha").hasClass('desk') ? Math.min(1, ($(window).height() - 41) / 332) : Math.min(1, ($(window).height() - 79) / 332);
                window.invertedScaleFactor = 1 - window.scaleFactor;
            } catch (_) { }

        });

        /** ##########################################################################
          * ######################## SETUP DRAG PARTS    #############################
          * ##########################################################################
          */

        /**
         * creates the three parts with 0s
         */
        function createParts() {
            window.part0 = {
                "x": 0,
                "y": 0,
                "z": 0
            };
            window.part1 = {
                "x": 0,
                "y": 0,
                "z": 0
            };
            window.part2 = {
                "x": 0,
                "y": 0,
                "z": 0
            };
            partCounter = 0;

            $(".butter").removeClass("on");
            $("#captchaImage, #part0, #part1, #part2").hide();
            $("#part0, #part1, #part2").css({
                left: "auto",
                top: "auto",
                right: "auto",
                bottom: "auto"
            });
        }
        createParts();

        /**
         * updates part coordinates during drag
         * @param {string} partName the part
         */
        function createOnDragHandler(partName) {

            const scaledWidth = $(window).width() * (1 + window.invertedScaleFactor) * 0.7;
            const scaledHeight = $(window).height() * (1 + window.invertedScaleFactor) * 0.7;
            const isDesk = $("#cutcha").hasClass('desk');

            return function () {

                const currentPart = $(this);

                const offset = currentPart.offset();
                const newLeft = offset.left * (1 + window.invertedScaleFactor);
                const newTop = offset.top * (1 + window.invertedScaleFactor);

                window[partName]['x'] = newLeft;
                window[partName]['y'] = newTop;
                window[partName]['z']++;
                partCounter++;

                if (!isDesk) {
                    if (window.part0['y'] != 0 && window.part1['y'] != 0 && window.part2['y'] != 0 && window.part0['y'] < scaledHeight && window.part1['y'] < scaledHeight && window.part2['y'] < scaledHeight) {
                        $('.butter').addClass('on');
                    } else {
                        $('.butter').removeClass('on');
                    }
                } else {
                    if (window.part0['x'] != 0 && window.part1['x'] != 0 && window.part2['x'] != 0 && window.part0['x'] < scaledWidth && window.part1['x'] < scaledWidth && window.part2['x'] < scaledWidth) {
                        $('.butter').addClass('on');
                    } else {
                        $('.butter').removeClass('on');
                    }
                }
            };
        }

        // set parts drag handler
        $(function () {

            const dragOpts = {};
            dragOpts.containment = "#cutcaptcha";
            dragOpts.scroll = false;
            dragOpts.cursor = 'crosshair';
            if (mobile) {
                dragOpts.cursorAt = {
                    "bottom": -25
                };
            }
            dragOpts.drag = createOnDragHandler("part0");
            $("#part0").draggable(dragOpts);

            dragOpts.drag = createOnDragHandler("part1");
            $("#part1").draggable(dragOpts);

            dragOpts.drag = createOnDragHandler("part2");
            $("#part2").draggable(dragOpts);
        });

        /** ##########################################################################
          * ######################## MAIN EVENT HANDLER   ############################
          * ##########################################################################
          */

        // add active body class
        setTimeout(function () {
            document.body.classList.add("active");
        }, 200);

        // toggle on click active body class
        document.addEventListener("click", function () {
            $("#capBody").toggleClass("active");
        });

        /**
         * setup everything and add submit handler
         */
        window.onload = function () {
            requestNewPuzzle();
            $("#capSubmit").on("click", submitSolution);
        };

        /** ##########################################################################
          * ######################## MORE FUNCS   ############################
          * ##########################################################################
          */

        let timerKey = null;
        let tickerIntervalID = null;
        var reloadPuzzle = function () { };

        /**
         * timer countdown updater
         */
        function updateCountdownTicker() {

            var timerElem = $("#timerCountdown");
            var secondsLeft = Number(timerElem.data('ticker'));

            if (secondsLeft > 1) {
                secondsLeft--;
                timerElem.text(secondsLeft);
                timerElem.data('ticker', secondsLeft);
            } else {

                timerElem.text('0');
                reloadPuzzle();
            }
        }

        /**
         * clears interval timer
         */
        function clearCountdownTicker() {
            try {
                clearInterval(tickerIntervalID);
            } catch (_) { }
        }

        /**
         * sets new interval timer and loads images
         */
        function startNewTicker() {

            clearCountdownTicker();
            tickerIntervalID = setInterval(updateCountdownTicker, 1000);

            reloadPuzzle = runOnce(function () {
                clearCountdownTicker();
                requestNewPuzzle();
            });
        }

        /**
         * loads images
         */
        function requestNewPuzzle() {

            if (window.top === window.self) {
                $("#capBody").html("direct access is not allowed");
                return;
            }
            createParts();

            const payload = {
                api_key: $("#capBody").data('apikey'),
                i: $("#capBody").data('i'),
                ts: Date.now()
            };

            if (timerKey != null) {
                payload.tk = timerKey;
            }

            $.post(`/captcha/${publicKey}.json`, payload, function (ret) {

                if (ret.succ == false) {
                    alert('timer' + ret);
                    return;
                }
                if ('timer' in ret) {

                    timerKey = ret.timer.key;
                    $("#timer").show();
                    $("#partarea").hide();
                    $("#timerCountdown").data('ticker', Number(ret.timer.time)).text(ret.timer.time);
                    startNewTicker();
                    return;

                }
                startMainTimer();
                $("#timer").hide();
                $("#partarea").show();

                window.captcha_token = ret.captcha_token;

                loadBlob(`/captcha/${publicKey}/${ret.captcha_question}/cut.png`, function () { }).then(function (cut) {

                    $("#captchaImage").attr('src', cut)
                        .load(function () {
                            $("#captchaImage").css({ 'height': '250px' }).css('display', 'block');
                        })
                        .error(function () {
                            requestNewPuzzle();
                        });

                }, requestNewPuzzle);

                var part0loaded = false;
                var part1loaded = false;
                var part2loaded = false;

                loadBlob(`/captcha/${publicKey}/${ret.captcha_question}/part0.png`, function () { }).then(function (part0) {
                    $("#part0")
                        .css({
                            'height': '',
                            'position': 'relative',
                            'display': 'none'
                        })
                        .attr('src', part0)
                        .load(function () {

                            if (part0loaded) return;
                            part0loaded = true;
                            var realHeight = parseInt($("#part0").height()) * window.scaleFactor;
                            $("#part0").css({
                                'height': `${realHeight}px`
                            }).show();

                        })
                        .error(function () {
                            requestNewPuzzle();
                        });
                }, requestNewPuzzle);

                loadBlob(`/captcha/${publicKey}/${ret.captcha_question}/part1.png`, function () { }).then(function (part1) {
                    $("#part1")
                        .css({
                            'height': '',
                            'position': 'relative',
                            'display': 'none'
                        })
                        .attr('src', part1)
                        .load(function () {

                            if (part1loaded) return;
                            part1loaded = true;
                            var realHeight = parseInt($("#part1").height()) * window.scaleFactor;
                            $("#part1").css({
                                'height': `${realHeight}px`
                            }).show();

                        })
                        .error(function () {
                            requestNewPuzzle();
                        });
                }, requestNewPuzzle);

                loadBlob(`/captcha/${publicKey}/${ret.captcha_question}/part2.png`, function () { }).then(function (part2) {
                    $("#part2")
                        .css({
                            'height': '',
                            'position': 'relative',
                            'display': 'none'
                        })
                        .attr('src', part2)
                        .load(function () {

                            if (part2loaded) return;
                            part2loaded = true;
                            var realHeight = parseInt($("#part2").height()) * window.scaleFactor;
                            $("#part2").css({
                                'height': `${realHeight}px`
                            }).show();

                        })
                        .error(function () {
                            requestNewPuzzle();
                        });
                }, requestNewPuzzle);
            });
        };

        /**
         * returns some big string from multiple parameters
         */
        function buildSecret() {

            const curTime = Date.now();
            const ipAddress = $("#capBody").data("ip");
            const flag = 0;

            const params = [
                recievedIA << 16,
                flag,
                !flag,
                runtimeFlag,
                curTime,
                curTime << 8,
                (curTime - (window.part0.z + window.part1.z + window.part2.z)).toString(33).toUpperCase(),
                curTime - scriptStartedTime,
                newCaptchasLoadedCount,
                Number(String(ipAddress).substr(0, 1)) > 5,
                puzzleLoadingTime,
                Number(!!Array.prototype.forEach),
                Number(!Array.prototype.indexOf),
                typeof Object.prototype.hasOwnProperty,
                location.href,
                tlh,
                fnvHash(location.href + tlh),
                MetrikaLoggingId, // currently an empty string
                tlhResponseTime - startTime
            ];

            const payload = JSON.stringify(params);

            const num = fnvHash(payload);
            const arr = [];

            const encoded = `${num}^${payload}`;
            let cnt = 0;

            encoded.split('').forEach(char => {

                let val;

                if (cnt & 2) {
                    val = char.charCodeAt(0) << 8;
                } else {
                    val = char.charCodeAt(0) << 32;
                }

                arr.push(val);
                ++cnt;
            });
            return arr.join(',');
        }

        /**
         * posts solution
         */
        function submitSolution() {

            const secret = buildSecret();
            const papiKey = buildPapiKey(secret);
            const papiHash = fnvHash(papiKey);

            $.ajax({
                url: `/captcha/${publicKey}/check`,
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify({
                    'version': $("#capBody").data("version"),
                    'ip': $("#capBody").data("ip"),
                    'captcha_token': window.captcha_token,
                    'solution': [
                        [parseInt(window.part0.x), parseInt(window.part0.y), window.part0.z],
                        [parseInt(window.part1.x), parseInt(window.part1.y), window.part1.z],
                        [parseInt(window.part2.x), parseInt(window.part2.y), window.part2.z]
                    ],
                    'f': Number(partCounter * partCounter).toString(32),
                    'i': $("#capBody").data("i"),
                    'api_key': $("#capBody").data("apikey"),
                    'papi': papiKey,
                    'px': papiHash
                }),
                success: function (data) {

                    if (data.succ == false) {

                        $("#captchaImage, #partarea").hide();
                        $("#msgContainer").show();
                        $(".false").show();
                        return;
                    }

                    if (data.correct) {

                        $("#captchaImage, #partarea").hide();
                        $("#msgContainer").show();
                        $(".success").show();

                        window.top.postMessage(window.captcha_token, "*");
                        try {
                            clearInterval(rlI);
                            clearInterval(pingPongIntervalID);
                        } catch (_) { }

                    } else {

                        $("#captchaImage, #partarea").hide();
                        $("#msgContainer").show();
                        $(".false").show();

                        setTimeout(function () {

                            $("#partarea").show();
                            $("#captchaImage").css('display', 'block');
                            $("#msgContainer").hide();
                            $('.false').hide();

                            Pace.restart();
                            requestNewPuzzle();
                        }, 1500);
                    }
                }
            });
        };

        let mainTimerId = null;

        /**
         * reloads a new captcha and counts the reloads
         * after 3 reloads -> error and quit
         */
        const maybeGetNewCaptcha = function maybeGetNewCaptcha() {

            if (++newCaptchasLoadedCount >= 4) {

                $("#captchaImage, #partarea").hide();
                $("#msgContainer").show();
                $(".false").show();
                clearInterval(pingPongIntervalID);
                return;
            }
            $("#partarea").show();
            $("#captchaImage").css('display', 'block');
            $("#msgContainer").hide();
            $('.false').hide();

            Pace.restart();
            requestNewPuzzle();
        };

        /**
         * starts 2 minute timer until captcha reset
         */
        const startMainTimer = function startMainTimer() {
            try {
                clearTimeout(mainTimerId);
            } catch (_) { }
            mainTimerId = setTimeout(maybeGetNewCaptcha, 120000);
        };
    };

    document.addEventListener("DOMContentLoaded", onLoad, false);
})();