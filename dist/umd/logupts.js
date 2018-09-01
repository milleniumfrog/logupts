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
        define(["require", "exports", "./placeholder", "./placeholder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const placeholder_1 = require("./placeholder");
    var placeholder_2 = require("./placeholder");
    exports.DefaultPlaceholders = placeholder_2.DefaultPlaceholders;
    exports.replacePlaceholder = placeholder_2.replacePlaceholder;
    exports.defaultOptions = {
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
            setInternals = setInternals || {};
            customOptions = customOptions || {};
            this.options = this.mergeOptions(customOptions, exports.defaultOptions);
            this.internals = {
                service: 'LOG'
            };
            for (let key in setInternals) {
                this.internals[key] = setInternals[key];
            }
        }
        mergeOptions(customOptions, fillOptions) {
            fillOptions = fillOptions || this.options;
            return {
                prefix: customOptions.prefix !== undefined ? customOptions.prefix : fillOptions.prefix,
                postfix: customOptions.postfix !== undefined ? customOptions.postfix : fillOptions.postfix,
                placeholders: customOptions.placeholders !== undefined ? customOptions.placeholders : fillOptions.placeholders,
                quiet: customOptions.quiet !== undefined ? customOptions.quiet : fillOptions.quiet,
                transports: customOptions.transports !== undefined ? customOptions.transports : fillOptions.transports,
                customFunctions: customOptions.customFunctions !== undefined ? customOptions.customFunctions : fillOptions.customFunctions,
                logType: customOptions.logType !== undefined ? customOptions.logType : fillOptions.logType,
                logStack: customOptions.logStack !== undefined ? customOptions.logStack : fillOptions.logStack,
            };
        }
        custom(customOptions, setInternals, message) {
            return __awaiter(this, void 0, void 0, function* () {
                let opt = this.mergeOptions(customOptions);
                for (let key in setInternals) {
                    this.internals[key] = setInternals[key];
                }
                let str = `${opt.prefix}${message}${opt.postfix}`;
                str = placeholder_1.replacePlaceholder((this.options.placeholders || []), str, this.internals);
                let asyncThings = [];
                for (let transport of opt.transports || []) {
                    asyncThings.push(transport.exec(this.internals, str));
                }
                for (let asyncExec of opt.customFunctions || []) {
                    asyncThings.push(asyncExec(str, this.internals, opt));
                }
                yield Promise.all(asyncThings);
                if (!opt.quiet && (console[opt.logType || 'log'] !== undefined)) {
                    console[opt.logType || 'log'](str);
                }
                return str;
            });
        }
        ;
        log(str, customOptions) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.custom(customOptions || {}, { service: 'LOG' }, str);
            });
        }
        error(error, customOptions) {
            return __awaiter(this, void 0, void 0, function* () {
                let opt = this.mergeOptions(customOptions || {});
                opt.logType = 'error';
                let str = error instanceof Error ? `${error.message}${(opt.logStack && error.stack !== undefined) ? '\n' + error.stack : ''}` : error;
                return this.custom(opt, { service: 'ERROR' }, str);
            });
        }
        warn(message, customOptions) {
            return __awaiter(this, void 0, void 0, function* () {
                let opt = this.mergeOptions(customOptions || {});
                opt.logType = 'warn';
                return this.custom(opt, { service: 'WARN' }, message);
            });
        }
    }
    exports.LogUpTs = LogUpTs;
});
//# sourceMappingURL=logupts.js.map