(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./placeholders"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const placeholders_1 = require("./placeholders");
    exports.Placeholder = placeholders_1.Placeholder;
    exports.defaultPlaceholders = placeholders_1.defaultPlaceholders;
    exports.DEBUG = true;
    class LogUpTs {
        constructor() {
            this.loguptsOptions = {
                praefix: '{{service}}',
                postfix: '',
                placeholders: placeholders_1.defaultPlaceholders,
                quiet: false,
            };
        }
        generateString(string) {
            function countUp(param) {
                for (let i = 0; i < param.length; ++i) {
                    if (param.substr(i, 3) === ')}}')
                        return i;
                }
                throw new Error('didnt close Placeholder');
            }
            string = string || '';
            let placeholders = this.loguptsOptions.placeholders || {};
            for (let propName in placeholders) {
                let regexDefault = new RegExp(`{{${placeholders[propName].key}}}`, 'gi');
            }
            return string;
        }
        internal(loguptsOptions, ...messages) {
            return messages[0];
        }
    }
    exports.LogUpTs = LogUpTs;
});
//# sourceMappingURL=logupts.js.map