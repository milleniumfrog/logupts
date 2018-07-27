"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function replaceSingle(key, string, replaceContent, flags) {
    // set default flags
    flags = flags || 'g';
    // create Regex
    let regex = new RegExp(key, flags);
    let res;
    let counter = 0;
    while ((res = regex.exec(string.slice(counter))) !== null) {
        string = string.replace(key, typeof replaceContent === 'function' ? replaceContent() : replaceContent);
        ++counter;
    }
    return string;
}
exports.replaceSingle = replaceSingle;
;
function replaceComplex(complexKeys, string) {
    for (let complex of complexKeys) {
        // single key placeholders
        if (complex.keys[1] === undefined) {
            string = complex.called !== true ? replaceSingle(complex.keys[0], string, complex.replacer, complex.flags) : string;
            complex.called = true;
        }
        // 2 key placeholders
        else {
            let maxIndex = -1;
            for (let inComplex of complexKeys) {
                // create Regular expression
                let regex = new RegExp(inComplex.keys[0], inComplex.flags);
                let res = regex.exec(string);
                if (res !== null) {
                    maxIndex = maxIndex < res.index ? res.index : maxIndex;
                }
            }
            if (maxIndex > 0) {
                string = string.slice(0, maxIndex) + replaceComplex(complexKeys, string.slice(maxIndex));
            }
            // search index where pattern is first time
            let regex = new RegExp(complex.keys[0], complex.flags);
            let res1 = regex.exec(string);
            if (res1 !== null) {
                // find closing pattern in string
                regex = new RegExp(complex.keys[1], complex.flags);
                let res2 = regex.exec(string);
                let removeEscapesFromKeys = [complex.keys[0].replace((new RegExp('\\\\', 'g')), ''), complex.keys[1].replace((new RegExp('\\\\', 'g')), '')];
                if (res2 !== null) {
                    // create new string
                    string = string.slice(0, res1.index) + complex.replacer(string.slice(res1.index + removeEscapesFromKeys[0].length, res2.index)) + string.slice(res2.index + removeEscapesFromKeys[1].length);
                }
            }
        }
    }
    return string;
}
exports.replaceComplex = replaceComplex;
