(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultPlaceholders = [
        {
            keys: ['{{date}}'],
            replacer: () => {
                return `${fillStrWithZeros(2, String((new Date()).getDate()))}`;
            },
            flags: 'g'
        },
        {
            keys: ['{{day}}'],
            replacer: () => {
                return `${fillStrWithZeros(2, String((new Date()).getDay()))}`;
            },
            flags: 'g'
        },
        {
            keys: ['{{month}}'],
            replacer: () => {
                return `${fillStrWithZeros(2, String((new Date()).getMonth() + 1))}`;
            },
            flags: 'g'
        },
        {
            keys: ['{{year}}'],
            replacer: () => {
                return `${(new Date()).getFullYear()}`;
            },
            flags: 'g'
        },
        {
            keys: ['{{hours}}'],
            replacer: () => {
                return `${fillStrWithZeros(2, String((new Date()).getHours()))}`;
            },
            flags: 'g'
        },
        {
            keys: ['{{minutes}}'],
            replacer: () => {
                return `${fillStrWithZeros(2, String((new Date()).getMinutes()))}`;
            },
            flags: 'g'
        },
        {
            keys: ['{{seconds}}'],
            replacer: () => {
                return `${fillStrWithZeros(2, String((new Date()).getSeconds()))}`;
            },
            flags: 'g'
        },
        {
            keys: ['{{service}}'],
            replacer: (none, passArguments) => {
                return `[${passArguments.service || 'DEFAULT'}]`;
            },
            flags: 'g'
        },
    ];
    function fillStrWithZeros(length, msg) {
        if (length < msg.length) {
            throw new Error('the message is longer than the wished length.');
        }
        else {
            for (let i = msg.length; i < length; ++i) {
                msg = '0' + msg;
            }
        }
        return msg;
    }
    exports.fillStrWithZeros = fillStrWithZeros;
});
//# sourceMappingURL=placeholder.js.map