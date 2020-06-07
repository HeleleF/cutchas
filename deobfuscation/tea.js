class Tea {

    static encrypt(plaintext, password) {
        plaintext = String(plaintext);
        password = String(password);

        if (plaintext.length == 0) return ''; // nothing to encrypt

        //  v is n-word data vector; converted to array of longs from UTF-8 string
        const v = Tea.strToLongs(Tea.utf8Encode(plaintext));
        //  k is 4-word key; simply convert first 16 chars of password as key
        const k = Tea.strToLongs(Tea.utf8Encode(password).slice(0, 16));

        const cipher = Tea.encode(v, k);

        // convert array of longs to string
        const ciphertext = Tea.longsToStr(cipher);

        // convert binary string to base64 ascii for safe transport
        const cipherbase64 = Tea.base64Encode(ciphertext);

        return cipherbase64;
    }

    static decrypt(ciphertext, password) {
        ciphertext = String(ciphertext);
        password = String(password);

        if (ciphertext.length == 0) return '';  // nothing to decrypt

        const v = Tea.strToLongs(Tea.base64Decode(ciphertext));
        const k = Tea.strToLongs(Tea.utf8Encode(password).slice(0, 16));

        const plain = Tea.decode(v, k);

        const plaintext = Tea.longsToStr(plain);

        const plainUnicode = Tea.utf8Decode(plaintext.replace(/\0+$/, ''));

        return plainUnicode;
    }

    static encode(v, k) {
        if (v.length < 2) v[1] = 0;
        const n = v.length;
        const delta = 0x9e3779b9;
        let q = Math.floor(6 + 52/n);

        let z = v[n-1], y = v[0];
        let mx, e, sum = 0;

        while (q-- > 0) {
            sum += delta;
            e = sum>>>2 & 3;
            for (let p = 0; p < n; p++) {
                y = v[(p+1)%n];
                mx = (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3 ^ e] ^ z);
                z = v[p] += mx;
            }
        }

        return v;
    }

    static decode(v, k) {
        const n = v.length;
        const delta = 0x9e3779b9;
        const q = Math.floor(6 + 52/n);

        let z = v[n-1], y = v[0];
        let mx, e, sum = q*delta;

        while (sum != 0) {
            e = sum>>>2 & 3;
            for (let p = n-1; p >= 0; p--) {
                z = v[p>0 ? p-1 : n-1];
                mx = (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3 ^ e] ^ z);
                y = v[p] -= mx;
            }
            sum -= delta;
        }

        return v;
    }

    static strToLongs(s) {

        const l = new Array(Math.ceil(s.length/4));
        for (let i=0; i<l.length; i++) {
            l[i] = s.charCodeAt(i*4)+ (s.charCodeAt(i*4+1)<<8) +(s.charCodeAt(i*4+2)<<16) + (s.charCodeAt(i*4+3)<<24);
        }
        return l;
    }

    static longsToStr(l) {
        let str = '';
        for (let i=0; i<l.length; i++) {
            str += String.fromCharCode(l[i] & 0xff, l[i]>>>8 & 0xff, l[i]>>>16 & 0xff, l[i]>>>24 & 0xff);
        }
        return str;
    }

    static utf8Encode(str) {
        return unescape(encodeURIComponent(str));
    }

    static utf8Decode(utf8Str) {
        try {
            return decodeURIComponent(escape(utf8Str));
        } catch (e) {
            return utf8Str;
        }
    }

    static base64Encode(str) {
        return btoa(str);
    }

    static base64Decode(b64Str) {
       return atob(b64Str);
    }

}
