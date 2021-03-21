let SCALE = 2.5;

const APIKEY = 'SAs61IAI';
const APIURL = `../train`;
const SUBMITURL = `http://localhost:7331/cutcha`;

const $cut = $("#cut");
const $p0 = $("#part0");
const $p1 = $("#part1");
const $p2 = $("#part2");

const $skip = $('#skipBtn').button({ disabled: true });
const $submit = $('#submitBtn').button({ disabled: true });
const $broken = $('#brokenBtn').button({ disabled: true });

const $header = $('.header');
const $stats = $('.stats');

const offset = $cut.offset();

let guid, token;

const getJSON = async (info, init) => {

    try {

        const resp = await fetch(info, init);
        const data = await resp.json();

        if (!data.hasOwnProperty('OK')) {
            data.OK = data.succ ?? true;
        }

        return data;

    } catch (e) {
        console.log(e);
        return { OK: false, result: e.message };
    }
};

const fetchPuzzle = async () => {

    $header.text(`Loading...`);

    const { OK, result } = await getJSON(`${SUBMITURL}/puzzle`);

    if (OK) {
        ({ question: guid, token: token } = result);

        $header.text(`ID: ${guid}`);

        $cut.attr('src', `${APIURL}/${guid}/cut.png`);
        $p0.css({ height: ``, width: ``, left: 'auto', top: 'auto' }).attr('src', `${APIURL}/${guid}/part0.png`);
        $p1.css({ height: ``, width: ``, left: 'auto', top: 'auto' }).attr('src', `${APIURL}/${guid}/part1.png`);
        $p2.css({ height: ``, width: ``, left: 'auto', top: 'auto' }).attr('src', `${APIURL}/${guid}/part2.png`);

        $submit.button("option", "disabled", false);
        $skip.button("option", "disabled", false);
        $broken.button("option", "disabled", false);

    } else {
        $header.text(`Error: ${result}`);
        $skip.button("option", "disabled", false);
    }
};

const reportPuzzle = async () => {
    return fetch(`${SUBMITURL}/puzzle`, {
        method: 'PUT',
        body: JSON.stringify({
            guid,
            type: 'broken'
        }),
    }).then(fetchPuzzle);
};

const submitSolution = async () => {

    $submit.button("option", "disabled", true);
    $skip.button("option", "disabled", true);
    $broken.button("option", "disabled", true);

    const off0 = $p0.offset();
    const y0 = Math.round((off0.top - offset.top) / SCALE);
    const x0 = Math.round((off0.left - offset.left) / SCALE);

    const off1 = $p1.offset();
    const y1 = Math.round((off1.top - offset.top) / SCALE);
    const x1 = Math.round((off1.left - offset.left) / SCALE);

    const off2 = $p2.offset();
    const y2 = Math.round((off2.top - offset.top) / SCALE);
    const x2 = Math.round((off2.left - offset.left) / SCALE);

    const { OK: success, message: err } = await getJSON(`${SUBMITURL}/puzzle`, {
        method: 'POST',
        body: JSON.stringify({
            coords: [x0, y0, x1, y1, x2, y2],
            guid,
            token
        }),
    });

    if (success) {
        console.log(`%cSolved ${guid}: [[${x0}, ${y0}], [${x1}, ${y1}], [${x2}, ${y2}]] (Token ${token})`, 'color: #B0FF0A; font-weight: bold');
    } else {
        console.warn(err);
    }

    fetchPuzzle();
};

const getStats = async () => {
    const stats = await getJSON(`${SUBMITURL}/stats`);

    if (stats.OK) {
        $stats.text(JSON.stringify(stats.result));
    } else {
        $header.text(stats.result);
    }
};

const partLoaded = (ev) => {
    const $img = $(ev.target);

    const h = $img.height() * SCALE;
    const w = $img.width() * SCALE;
    $img.css({ height: `${h}px`, width: `${w}px` });
};

$cut.on('load', function () {
    //remove spinner
});
$p0.on('load', partLoaded);
$p1.on('load', partLoaded);
$p2.on('load', partLoaded);

$broken.on('click', reportPuzzle);
$skip.on('click', fetchPuzzle);
$submit.on('click', submitSolution);

$(() => {
    $(".part").draggable({ containment: ".container" });

    fetchPuzzle();

    setInterval(getStats, 60000);
    getStats();
});