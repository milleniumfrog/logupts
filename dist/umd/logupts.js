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
                praefix: '{{service}} ',
                postfix: '',
                placeholders: placeholders_1.defaultPlaceholders,
                quiet: false,
            };
            this.placeholderVars = {
                activeService: 'LOG'
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
                string = string.replace(regexDefault, placeholders[propName].replace(this.placeholderVars, ''));
            }
            return string;
        }
        mergeStringArray(textArr) {
            let str = '';
            for (let strPart of textArr) {
                if (typeof strPart !== 'string') {
                    strPart = this.mergeStringArray(strPart);
                }
                str += strPart;
            }
            return str;
        }
        prepareLogUpTsOptions(logUpTsOptions, messageArr) {
            if (typeof logUpTsOptions === 'string') {
                if (messageArr === undefined)
                    throw new TypeError('if loguptsOptions is a string then the messageArr is needed');
                messageArr.unshift(logUpTsOptions);
                return this.loguptsOptions;
            }
            else if (logUpTsOptions === undefined) {
                if (messageArr === undefined)
                    throw new TypeError('if loguptsOptions is a string then the messageArr is needed');
                messageArr.unshift('');
                return this.loguptsOptions;
            }
            else {
                let opt = JSON.parse(JSON.stringify(this.loguptsOptions));
                for (let propKey in logUpTsOptions) {
                    opt[propKey] = logUpTsOptions[propKey];
                }
                return opt;
            }
        }
        execInternalOptions(internalOptions) {
            for (let key in internalOptions) {
                switch (key) {
                    case "activeService":
                        this.placeholderVars.activeService = internalOptions.activeService;
                        break;
                }
            }
        }
        internal(loguptsOptions, internalOptions, ...messages) {
            let opt = this.prepareLogUpTsOptions(loguptsOptions, messages);
            this.execInternalOptions(internalOptions);
            let str = this.loguptsOptions.praefix + this.mergeStringArray(messages)
                + this.loguptsOptions.postfix;
            str = this.generateString(str);
            return str;
        }
        log(loguptsOptions, ...message) {
            let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
            let internalOptions = {
                activeService: "LOG"
            };
            return this.internal(opt || {}, internalOptions, message);
        }
    }
    exports.LogUpTs = LogUpTs;
});
//# sourceMappingURL=logupts.js.map