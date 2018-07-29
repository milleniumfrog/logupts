var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./placeholder", "strplace", "./placeholder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const placeholder_1 = require("./placeholder");
    const strplace_1 = require("strplace");
    var placeholder_2 = require("./placeholder");
    exports.DefaultPlaceholders = placeholder_2.DefaultPlaceholders;
    let defaultOptions = {
        prefix: '{{service}} ',
        postfix: '',
        placeholders: placeholder_1.DefaultPlaceholders,
        quiet: false,
        transports: [],
        customFunctions: [],
        logType: 'log',
        logStack: true,
    };
    class LogUpTs {
        constructor(customOptions, setInternals) {
            customOptions = customOptions || {};
            // set loguptsoptions
            this.options = {
                prefix: customOptions.prefix !== undefined ? customOptions.prefix : defaultOptions.prefix,
                postfix: customOptions.postfix !== undefined ? customOptions.postfix : defaultOptions.postfix,
                placeholders: customOptions.placeholders !== undefined ? customOptions.placeholders : defaultOptions.placeholders,
                quiet: customOptions.quiet !== undefined ? customOptions.quiet : defaultOptions.quiet,
                transports: customOptions.transports !== undefined ? customOptions.transports : defaultOptions.transports,
                customFunctions: customOptions.customFunctions !== undefined ? customOptions.customFunctions : defaultOptions.customFunctions,
                logType: customOptions.logType !== undefined ? customOptions.logType : defaultOptions.logType,
                logStack: customOptions.logStack !== undefined ? customOptions.logStack : defaultOptions.logStack,
            };
            // set defaultinternals
            this.internals = {
                service: 'LOG'
            };
            for (let key in setInternals || {}) {
                this.internals[key] = setInternals[key];
            }
        }
        mergeOptions(customOptions) {
            return {
                prefix: customOptions.prefix !== undefined ? customOptions.prefix : this.options.prefix,
                postfix: customOptions.postfix !== undefined ? customOptions.postfix : this.options.postfix,
                placeholders: customOptions.placeholders !== undefined ? customOptions.placeholders : this.options.placeholders,
                quiet: customOptions.quiet !== undefined ? customOptions.quiet : this.options.quiet,
                transports: customOptions.transports !== undefined ? customOptions.transports : this.options.transports,
                customFunctions: customOptions.customFunctions !== undefined ? customOptions.customFunctions : this.options.customFunctions,
                logType: customOptions.logType !== undefined ? customOptions.logType : this.options.logType,
                logStack: customOptions.logStack !== undefined ? customOptions.logStack : this.options.logStack,
            };
        }
        custom(customOptions, setInternals, message) {
            return __awaiter(this, void 0, void 0, function* () {
                // setoptions
                let opt = this.mergeOptions(customOptions);
                // set new Internalvalues
                for (let key in setInternals) {
                    this.internals[key] = setInternals[key];
                }
                // generate string
                let str = `${opt.prefix}${message}${opt.postfix}`;
                str = strplace_1.replaceComplex((this.options.placeholders || []), str, this.internals);
                let asyncThings = [];
                // add transports
                for (let transport of opt.transports || []) {
                    asyncThings.push(transport.exec(this.internals, str));
                }
                for (let asyncExec of opt.customFunctions || []) {
                    asyncThings.push(asyncExec(str, this.internals, opt));
                }
                yield Promise.all(asyncThings);
                // check 
                if (!opt.quiet && (console[opt.logType || 'log'] !== undefined)) {
                    console[opt.logType || 'log'](str);
                }
                return str;
            });
        }
        ;
        log(str, customOptions) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.custom(customOptions || {}, { service: 'LOG' }, str);
            });
        }
        error(error, customOptions) {
            return __awaiter(this, void 0, void 0, function* () {
                let opt = this.mergeOptions(customOptions || {});
                // set logtype to error -> console.error(str)
                opt.logType = 'error';
                let str = error instanceof Error ? `${error.message}${(opt.logStack && error.stack !== undefined) ? '\n' + error.stack : ''}` : error;
                return yield this.custom(opt, { service: 'ERROR' }, str);
            });
        }
    }
    exports.LogUpTs = LogUpTs;
});
