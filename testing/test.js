const c1 = document.getElementById("myCanvas1");
const ctx1 = c1.getContext("2d", {
    alpha: true
});
const c2 = document.getElementById("myCanvas2");
const ctx2 = c2.getContext("2d", {
    alpha: true
});

const p = document.querySelector('p.p');
const plane = document.getElementById('plane');

const bitToRGB = (bit) => {
    return [bit & 0xFF, bit >> 8 & 0xFF, bit >> 16 & 0xFF];
};

const bitToHsl = (v) => {
    const rgb = bitToRGB(v);

    let r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255,
        max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        h,
        s,
        l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            default:
                throw new TypeError();
        }
        h /= 6;
    }

    return {
        h: h,
        s: s,
        l: l
    }
};

const i = new Image();
i.onload = () => {
    console.log('1');
    ctx1.drawImage(i, 0, 0);
    ctx2.drawImage(i, 0, 0);

    const iData1 = ctx1.getImageData(0, 0, 488, 332);
    const buf32 = new Uint32Array(iData1.data.buffer);

    const iData2 = ctx2.getImageData(0, 0, 488, 332);
    const new32 = new Uint32Array(iData2.data.buffer);

    const len = buf32.length;

    const count = {};

    for (let i = 0; i < len; i++) {
        let k = buf32[i];

        if (k === 0xFF000000) {
            new32[i] = 0xFF000000;
            continue;
        }

        const { l } = bitToHsl(k);

        if (l < 0.95) {
            new32[i] = 0xFF000000;
        }

        if (count[k]) {
            count[k]++;
        } else {
            count[k] = 1;
        }
    }

    const res = Object.keys(count).map(k => {
        return {
            bit: +k,
            count: count[k],
            r: k & 0xFF,
            g: k >> 8 & 0xFF,
            b: k >> 16 & 0xFF,
            alpha: k >> 24 & 0xFF,
        }
    }).sort((x,y) => y.count - x.count);
    window.r = res;

    res.filter(e => e.count > 3).forEach(e => {
        const newp = p.cloneNode();
        newp.textContent = e.count + JSON.stringify(bitToHsl(e.bit));
        newp.style.backgroundColor = `rgb(${e.r},${e.g},${e.b})`;
        plane.appendChild(newp);

    });

    ctx2.putImageData(iData2, 0, 0);
};

i.src = 'cut.png';

const downloadCanvas = (cc) => {
    let a = document.getElementById("canvasDownloader");

    if (!a) {
        a = document.createElement('a');
        a.id = 'canvasDownloader';
        a.style.visibility = 'none';
        document.body.appendChild(a);
    }

    a.href = cc.toDataURL("image/png").replace("image/png", "image/octet-stream");
    a.download = 'canvas.png';
    a.click();
};

const check = () => {

    const a = str.split('\n');
    const len = a.length;

    const result = {};

    for (let i = 0; i < 36; i++) {

        if (i === 8 ||i === 13 || i === 18 || i === 23) continue;

        result[i] = new Set();

        for (let j = 0; j < len; j++) {
            result[i].add(a[j][i])
        }
    }

    // stelle 14 ist immer 4
    // stelle 19 ist immer 8,9,b oder a
    // alle anderen sind hex
}
