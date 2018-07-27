"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strplace_1 = require("./strplace");
describe('replaceSingle', () => {
    it('simple', () => {
        let str = '{{repl}} is replaced';
        expect(strplace_1.replaceSingle('{{repl}}', str, 'This')).toEqual('This is replaced');
        expect(strplace_1.replaceSingle('{{repl} }', str, 'This')).toEqual('{{repl}} is replaced');
    });
});
describe('replace Complex', () => {
    it('complex', () => {
        let str = '<str><hello/> <a>this is a referrer<a>this is a referrer</a></a></str>';
        let keys = [
            {
                flags: 'g',
                keys: ['<hello/>'],
                replacer: (args) => { return 'hello'; }
            },
            {
                flags: 'g',
                keys: ['<a>', '</a>'],
                replacer: (args) => { return `<l>${args}</l>`; }
            }
        ];
        expect(strplace_1.replaceComplex(keys, str)).toEqual('<str>hello <l>this is a referrer<l>this is a referrer</l></l></str>');
        str = '{{str(this is a text)}}';
        keys = [
            {
                flags: 'g',
                keys: ['\\{\\{str\\(', '\\)\\}\\}'],
                replacer: (args) => { return args; }
            }
        ];
        expect(strplace_1.replaceComplex(keys, str)).toEqual('this is a text');
    });
});
