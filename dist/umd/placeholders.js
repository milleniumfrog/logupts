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
        constructor(key, replaceVar) {
            this.key = key;
            this.replaceVar = replaceVar;
        }
        replace(logObjPlaceholderVars, param) {
            if (typeof this.replaceVar === 'string') {
                return this.replaceVar;
            }
            if (param.length === 0) {
                return this.replaceVar(logObjPlaceholderVars);
            }
            else {
                param = `[${param}]`;
                return this.replaceVar(logObjPlaceholderVars, JSON.parse(param));
            }
        }
    }
    exports.Placeholder = Placeholder;
    exports.defaultPlaceholders = {
        date: new Placeholder('date', `${fillStrWithZeros(2, String((new Date()).getDate()))}`),
        day: new Placeholder('day', `${fillStrWithZeros(2, String((new Date()).getDay()))}`),
        month: new Placeholder('month', `${fillStrWithZeros(2, String((new Date()).getMonth() + 1))}`),
        fullYear: new Placeholder('fullYear', `${(new Date()).getFullYear()}`),
        year: new Placeholder('year', `${(new Date()).getFullYear()}`),
        hours: new Placeholder('hours', `${fillStrWithZeros(2, String((new Date()).getHours()))}`),
        minutes: new Placeholder('minutes', `${fillStrWithZeros(2, String((new Date()).getMinutes()))}`),
        seconds: new Placeholder('seconds', `${fillStrWithZeros(2, String((new Date()).getSeconds()))}`),
        frog: new Placeholder('frog', 'All Contributers: milleniumfrog'),
        service: new Placeholder('service', ((placeholderVars) => {
            return `[${placeholderVars.activeService}]`;
        })),
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