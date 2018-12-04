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
    var LOGLEVEL;
    (function (LOGLEVEL) {
        LOGLEVEL[LOGLEVEL["TRACE"] = 0] = "TRACE";
        LOGLEVEL[LOGLEVEL["DEBUG"] = 1] = "DEBUG";
        LOGLEVEL[LOGLEVEL["INFO"] = 2] = "INFO";
        LOGLEVEL[LOGLEVEL["WARN"] = 3] = "WARN";
        LOGLEVEL[LOGLEVEL["ERROR"] = 4] = "ERROR";
        LOGLEVEL[LOGLEVEL["OFF"] = 5] = "OFF";
    })(LOGLEVEL = exports.LOGLEVEL || (exports.LOGLEVEL = {}));
    exports.defaultOptions = {
        prefix: '{{service}} ',
        postfix: '',
        placeholders: placeholder_1.DefaultPlaceholders,
        quiet: false,
        transports: [],
        customFunctions: [],
        logType: 'log',
        logStack: true,
        logLevel: LOGLEVEL.INFO
    };
    class LogUpTs {
        constructor(customOptions, setInternals) {
            setInternals = setInternals || {};
            customOptions = customOptions || {};
            this.options = this.mergeOptions(customOptions, exports.defaultOptions);
            this.internals = {
                service: 'log',
            };
            Object.assign(this.internals, setInternals);
        }
        mergeOptions(customOptions, fillOptions) {
            fillOptions = fillOptions || this.options;
            if (customOptions.quiet)
                customOptions.logLevel = LOGLEVEL.OFF;
            return Object.assign({}, fillOptions, customOptions);
        }
        custom(customOptions, setInternals, message, logLevel = LOGLEVEL.INFO) {
            return __awaiter(this, void 0, void 0, function* () {
                let opt = this.mergeOptions(customOptions);
                for (let key in setInternals) {
                    this.internals[key] = setInternals[key];
                }
                let str = `${opt.prefix}${message}${opt.postfix}`;
                str = placeholder_1.replacePlaceholder((this.options.placeholders || []), str, this.internals);
                if ((opt.logLevel || 0) <= logLevel && (console[opt.logType || 'log'] !== undefined)) {
                    console[opt.logType || 'log'](str);
                }
                let asyncThings = [];
                for (let transport of opt.transports || []) {
                    asyncThings.push(transport.exec(this.internals, str));
                }
                for (let asyncExec of opt.customFunctions || []) {
                    asyncThings.push(asyncExec(str, this.internals, opt));
                }
                yield Promise.all(asyncThings);
                return str;
            });
        }
        ;
        log(str, customOptions) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.custom(customOptions || {}, { service: 'LOG' }, str, LOGLEVEL.INFO);
            });
        }
        error(error, customOptions) {
            return __awaiter(this, void 0, void 0, function* () {
                let opt = this.mergeOptions(customOptions || {});
                opt.logType = 'error';
                let str = error instanceof Error ? `${error.message}${(opt.logStack && error.stack !== undefined) ? '\n' + error.stack : ''}` : error;
                return this.custom(opt, { service: 'ERROR' }, str, LOGLEVEL.ERROR);
            });
        }
        warn(message, customOptions) {
            return __awaiter(this, void 0, void 0, function* () {
                let opt = this.mergeOptions(customOptions || {});
                opt.logType = 'warn';
                return this.custom(opt, { service: 'WARN' }, message, LOGLEVEL.WARN);
            });
        }
        trace(message, customOptions) {
            return __awaiter(this, void 0, void 0, function* () {
                let opt = this.mergeOptions(customOptions || {});
                opt.logType = 'trace';
                return this.custom(opt, { service: 'TRACE' }, message, LOGLEVEL.TRACE);
            });
        }
        debug(message, customOptions) {
            return __awaiter(this, void 0, void 0, function* () {
                let opt = this.mergeOptions(customOptions || {});
                opt.logType = 'debug';
                return this.custom(opt, { service: 'DEBUG' }, message, LOGLEVEL.DEBUG);
            });
        }
        info(str, customOptions) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.custom(customOptions || {}, { service: 'INFO' }, str, LOGLEVEL.INFO);
            });
        }
    }
    exports.LogUpTs = LogUpTs;
    exports.default = LogUpTs;
});
//# sourceMappingURL=logupts.js.map