# Filecrypt Cutcaptcha Flow

## Initial setup

The filecrypt site contains the following part, which starts the cutcaptcha flow.

```html
<form method="post" id="cform">
    <script>
        var CUTCAPTCHA_MISERY_KEY = "a77b59bbead40054aec78b0aa2474391b0e27b2a";
        var capResponseCallback = function(token) { $("cform").submit(); }
    </script>
    <script src="https://cutcaptcha.com/captcha/SAs61IAI.js"></script>

    <div id="puzzle-captcha">
        <input id="cap_token" type="hidden" name="cap_token">
    </div>
</form>
```

`SAs61IAI` is Filecrypts's apikey.

`CUTCAPTCHA_MISERY_KEY` seems to be unused (atleast here).

## Initial script

The script from Step 1 is in `cutcha.main.js`. The annotated, deobfuscated version is in `cutcha.main.annotated.js`.

Everything runs in a big closure.

First, it tries to read the key `$R` from local storage. If it doesnt exists, it creates one with a random hex string of length 9 or 10.

Next, an `onmessage()` handler is added to the filecrypt window.

 - If origin of message is not the same domain, do nothing
 - If data of message is a json string:
    - If `tlh`, send message to sender with key `tlh:response` and the current site URL as payload
    - If `ping`, send message to sender with key `pong` and current timestamp as payload
 - Else: Set `captcha_token` to message data 
    - If `capResponseCallback()` exists, call it with this value.

Lastly, an event listener is added to document, that runs on `DOMContentLoaded`.

 - Check some conditions and abort if atleast one is true
    - Does a function `closeWindowOrTab()` exist?
    - If `capResponseCallback()` exists, does it contain the string `xhr`?
    - Is the current URL `localhost` or a literal ipv4 address?
        - (not checked if the key `dd_dev` is set in local storage)
    - Is the current URL a known captcha solving site?
    - Is there atleast one `LINK` element with specific attributes?
 - Create a new iframe and append it to the element with id `puzzle-captcha`.
 - Create an object with multiple parameters:

```js
const payload = {
    api_key: // the api key for this site,
    r: // value of $R key,
    c: // current timestamp,
    l: // script start timestamp
    r: // hostname, here always filecrypt.cc,
    i: // random string with length 32, unique for each reload?
    sh: // iframe height divided by 332,
    sw: // iframe width divided by 488,
    m: // boolean, whether its mobile or not
};
```
 - Create a new form element on the filecrypt document
 - Add all fields from `payload` as hidden input fields to the form
 - Set form URL to `https://{DOMAIN}/captcha/{APIKEY}.html`
    - here, this is `https://cutcaptcha.com/captcha/SAs61IAI.html`
 - Configure form so content gets `POST`ed to the iframe window
 - Submit the form and immeadetily remove it
 - Check if element with id `cap_token` exists on the filecrypt document
    - If not, create it as hidden input and add it to element with id `puzzle-captcha`
 - Run a user / bot detection function
    - If user was detected, send a message to the iframe window with key `iA` and payload `true`.

## Iframe content

The iframe loads the html document from the form submit.

```html
<!DOCTYPE html>
<html>
<head>
    <!-- styles -->
    <script>
    /**
     * Promise polyfill, Pace, Sandblaster
     * Jquery stuff
     * Metrika Tracking
     * docReady() function
     */
    </script>
    <script>//obfuscated logic</script>
</head>
<body id="capBody" 
    data-apikey="<APIKEY>" 
    data-pubk="<APIKEY>" 
    data-i="<RANDOM STRING>" 
    data-ip="1418620360" 
    data-version="1.0">
    <!-- html -->
</body>
</html>
```

[Pace](https://github.com/HubSpot/PACE) is included to monitor ajax requests and display a locading bar.

[Sandblaster](https://github.com/JamesMGreene/sandblaster) is used to detect Iframe stuff.

Metrika is some tracking library, which gets blocked by uBlock anyways.

`docReady` is basically an alias for `document.addEventListener("DOMContentLoaded")`
(see `cutcha.iframe.docready.js`)

The actual logic is in `cutcha.iframe.js`. The annotated, deobfuscated version is in `cutcha.iframe.annotated.js`.
Again, everything runs in one big closure.

The dataset parameter of body are taken from the form POST request. 
- `apikey` and `pubk` seem to be always the same (here always `SAs61IAI`). 
- `i` is the same random string as before
- `version` is always `"1.0"`. 
- `ip` is apparently an IPv4 adresses without the separators. (**But its not the client IP?**)

## Iframe script

All logic is defined in a function that runs on `DOMContentLoaded` at the earliest.

First, `sandblaster` is used to detect if the iframe is sandboxed. If yes, script is aborted with error message.

The same user/bot detection function is included here, but never called.

An `onmessage()` handler is added to the iframe window.
 - The message data is parsed as JSON.
 - Choose action on key:
    - If `tlh:response`, set global variable tlh to the data
    - If `pong`, set global variable lastPong to current time
    - If `iA`, a local flag is set to 1 (was 0)

A message with key `tlh` is send to the filecrypt window. The time until tlh_reponse is stored.
A message with key `ping` is send to the filecrypt window. An interval timer is added, that runs every second.
Each time a new ping is send. If the last ping is more than 3 seonds and thereis now variable `tlh`, the script exists.

Two global variables `scaleFactor` are created.

The `pace` framwework is intialized.

The parts are created and their drag handler set up. Each part is a global variable with 3 fields
```js
window.part0 = {
    x: 0,
    y: 0,
    z: 0
};
```
After `200ms`, the `active` class is added to the iframe document body. An `onclick` handler is added to the iframe document that toggles this class. (**WHY?**)

An `onload` handler is aded to the iframe window that adds a click handler to submit button and requests the first puzzle.

## Requesting a puzzle

First, the parts are created as new.

A POST request is made to `https://cutcaptcha.com/captcha/{APIKEY}.json`.
(Here, this is `https://cutcaptcha.com/captcha/SAs61IAI.json`)

The response is a JSON object with 3 or more fields.

- `succ` signals whether the request was successfull.
- `timer` (if present) adds a countdown timer before the actual puzzle starts
- `captcha_question` is an [UUIDv4](http://davidsouther.com/superscore/docs/uuid.html) for a unique puzzle.
- `captcha_token` is the random string token that will be passed to the main filecrypt window after solving.

`captcha_token` is added to the iframe window as a global variable.

A timeout handler is added that runs after 2 minutes. In there, a new puzzle is requested and the number of requests is counted. After the fourth request, all timers are stopped and the script returns with an error message.

Four `XMLHTTPRequests` are made to load the four images.

The URL format is `https://cutcaptcha.com/captcha/{APIKEY}/{QUESTION_UUID}/{NAME}.png`, where `NAME` is one of `part0`, `part1`, `part2` (the puzzle pieces), `cut` (the main image).

The result is an `arraybuffer` that is converted to a `Blob`. 
The images are then loaded via `createObjectURL(blob)` for their corresponding html elements. The height of the three parts is scaled by multiplying it with `scaleFactor`. 

If any of the requests fail, a new puzzle will be requested.

At this point, the main image and the three parts are visible and need to be solved in less than 2 minutes.


## Dragging a part

The dragging behaviour is done with Jquery.

For each part:
- `x` is the left offset of its html element, multiplied with `(1 + window.invertedScaleFactor)`.
- `y` is the top offset of its html element, multiplied with `(1 + window.invertedScaleFactor)`.
- `z` is a simple counter that increases for each drag event.

A variable `partCounter` counts the drag events for all parts, so `partCounter === window.part0.z + window.part1.z + window.part2.z`


## Submit solution

A `POST` request is made to `https://cutcaptcha.com/captcha/{APIKEY}/check`.

The body of the request is a json object:

```js
{
    'version': // the *version* parameter from above,
    'ip': // the *ip* parameter from above,
    'captcha_token': window.captcha_token,
    'solution': [
        [parseInt(window.part0.x), parseInt(window.part0.y), window.part0.z],
        [parseInt(window.part1.x), parseInt(window.part1.y), window.part1.z],
        [parseInt(window.part2.x), parseInt(window.part2.y), window.part2.z]
    ],
    'f': Number(partCounter * partCounter).toString(32),
    'i': // the *i* parameter from above,
    'api_key': // the *pubk* parameter from above,
    'papi': papiKey,
    'px': hash_function(papiKey)
}
```
For `partCounter`, see the previous chapter. For the generation of `papiKey`, see the next chapter.
The `hash_function` used here is `FNV-1(32bit)`. More about FNV-1 [here](http://www.isthe.com/chongo/tech/comp/fnv/).


The expected return value is a JSON object with the fields `succ` and `correct`.

`succ` signals whether the reuest was successful, correct signals whether the solution was correct.

If `succ` is `false`, the script ends with an error message.

When `correct` `true`, the captcha token is send to the filecrypt window and all timers are ended.
If not, after 1.5 seconds a new puzzle is requested.

## PAPI Key

This is a huge string that is created in two stages.

- First, multiple parameters and puzzle values are mashed together into one string `secret`.
- `secret` is then encrypted using the `xxTEA` algorithm. 
    - The password is the `i` Parameter from above with a single `"_"` (underscore) prepended.

The encrypted result string is the `papiKey`.

### Generation of secret

1. Create an array `params` with multiple values.
2. Stringify `params` into string `payload`.
3. Hash `payload` with FNV-1.
4. Create new string as follows: `"hash^payload"`
5. Map each char of this string to a number
    - chars are mapped to `charCode << n`
    - `n` alternates between `8` and `32` every two chars, starting with `32`
6. Join the new array with `","` (comma).
7. Return this string.

#### Example conversion
```js
            const a1 = 'hash^payload';
            const b1 = a1.split('').map((c, i) => c.charCodeAt(0) << (i & 2 ? 8 : 32)).join(',');
            const a2 = b1.split(',').map((n, i) => String.fromCharCode((i & 2 ? (n >> 8) : (n >> 32)))).join('');
            console.log(a1 === a2); // true
```
### Parameters

Following snippet shows the whole array:

```js
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
    Number(ipAddress.substr(0, 1)) > 5,
    puzzleLoadingTime,
    Number(!!Array.prototype.forEach),
    Number(!Array.prototype.indexOf),
    typeof Object.prototype.hasOwnProperty,
    location.href,
    tlh,
    fnvHash(location.href + tlh),
    MetrikaLoggingId,
    tlhResponseTime - startTime
];
```

- `recievedIA`: either `0` or `1`, for normal script execution this is always `1` (meaning the filecrypt site 'talked' to us)
- `flag`: always `0`
- `runTime`: always `1`
- `curTime`: always `Date.now()`
- `newCaptchasLoadedCount`: integer in `[0, 4]`
- `ipAddress`: the `ip` parameter from the iframe body
- `puzzleLoadingTime`: time in milliseconds
- `tlh`: always `"https://filecrypt.co/Container/LINKID.html"`
- `MetrikaLoggingId`: always `"disabled"` (currently disabled on filecrypt)

Some assumptions:

- Puzzle is always solved on the first try, so `newCaptchasLoadedCount` is `0`
- modern browser, meaning:
    - `typeof Object.prototype.hasOwnProperty === 'function'`
    - `Number(!Array.prototype.indexOf) === 0`
    - `Number(!!Array.prototype.forEach) === 1`
- `ip` parameter is valid IPv4, so its first digit can never be greater than 5

So the standard array looks like this:

```js
const standard = [
    65536,
    0,
    true,
    1,
    curTime,
    curTime << 8,
    (curTime - (window.part0.z + window.part1.z + window.part2.z)).toString(33).toUpperCase(),
    10000, // simulate 10 seconds solving time
    0,
    false,
    500, // observed from real timings,
    1,
    0,
    "function",
    "https://cutcaptcha.com/captcha/SAs61IAI.html",
    "https://filecrypt.co/Container/5A44E51132.html",
    1815630277,
    "disabled",
    20 // observed from real timings
];
```

Requesting a new `i` parameter:

```js
    const getI = async () => {

        try {

            const code = await fetch('https://cutcaptcha.com/captcha/SAs61IAI.js').then(r => r.text());
            const match = code.match(/\'\\x48\\x6b\\x69\\x61\\x58\'\:\'(?<i>\S{32})\'/);

            return match.groups.i;
        } catch ({ message }) {

            if (message.includes('fetch')) {
                console.debug('Request failed!');         
            } else if (message.includes('groups')) {
                console.debug('Not found!');
            } else {
                console.debug('Huh?');
            }
            return '0'.repeat(32);
        }
    };
```