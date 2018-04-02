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
    class Placeholder {
        constructor(key, replacerOrFn = "") {
            this.key = key;
            if (typeof replacerOrFn === 'string') {
                this.replacer = replacerOrFn;
                this.replacerFn = Placeholder.defaultFn;
            }
            else {
                this.replacerFn = replacerOrFn;
                this.replacer = Placeholder.default;
            }
        }
        static defaultFn(param) {
            return ("this placeholder doesn´t supports functions");
        }
        static onlyString(param) {
            if ((typeof param).toLowerCase() !== 'string')
                throw new Error("this placeholder doesn´t supports functions without a string as param");
        }
    }
    Placeholder.default = "this placeholder doesn´t supports no Function";
    exports.Placeholder = Placeholder;
    exports.Placeholders = {
        date: new Placeholder('date', `${(new Date()).getDate()}`),
        day: new Placeholder('day', `${(new Date()).getDay()}`),
        month: new Placeholder('month', `${(new Date()).getMonth()}`),
        fullYear: new Placeholder('date', `${(new Date()).getFullYear()}`),
        hours: new Placeholder('date', `${(new Date()).getHours()}`),
        minutes: new Placeholder('date', `${(new Date()).getMinutes()}`),
        seconds: new Placeholder('date', `${(new Date()).getSeconds()}`),
        service: new Placeholder('service', ((placeholderVars) => {
            return `[${placeholderVars.activeService}]`;
        }))
    };
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
});
//# sourceMappingURL=placeholders.js.map