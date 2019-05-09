var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { DefaultPlaceholders, replacePlaceholder } from './placeholder';
export { DefaultPlaceholders, replacePlaceholder } from './placeholder';
export var LOGLEVEL;
(function (LOGLEVEL) {
    LOGLEVEL[LOGLEVEL["TRACE"] = 0] = "TRACE";
    LOGLEVEL[LOGLEVEL["DEBUG"] = 1] = "DEBUG";
    LOGLEVEL[LOGLEVEL["INFO"] = 2] = "INFO";
    LOGLEVEL[LOGLEVEL["WARN"] = 3] = "WARN";
    LOGLEVEL[LOGLEVEL["ERROR"] = 4] = "ERROR";
    LOGLEVEL[LOGLEVEL["OFF"] = 5] = "OFF";
})(LOGLEVEL || (LOGLEVEL = {}));
export var defaultOptions = {
    prefix: '{{service}} ',
    postfix: '',
    placeholders: DefaultPlaceholders,
    quiet: false,
    transports: [],
    customFunctions: [],
    logType: 'log',
    logStack: true,
    logLevel: LOGLEVEL.INFO
};
var LogUpTs = (function () {
    function LogUpTs(customOptions, setInternals) {
        setInternals = setInternals || {};
        customOptions = customOptions || {};
        this.options = this.mergeOptions(customOptions, defaultOptions);
        this.internals = {
            service: 'log'
        };
        Object.assign(this.internals, setInternals);
    }
    LogUpTs.prototype.mergeOptions = function (customOptions, fillOptions) {
        fillOptions = fillOptions || this.options;
        if (customOptions.quiet)
            customOptions.logLevel = LOGLEVEL.OFF;
        return Object.assign({}, fillOptions, customOptions);
    };
    LogUpTs.prototype.custom = function (customOptions, setInternals, message, logLevel) {
        if (logLevel === void 0) { logLevel = LOGLEVEL.INFO; }
        return __awaiter(this, void 0, void 0, function () {
            var opt, key, str, asyncThings, _i, _a, transport, _b, _c, asyncExec;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        opt = this.mergeOptions(customOptions);
                        for (key in setInternals) {
                            this.internals[key] = setInternals[key];
                        }
                        str = "" + opt.prefix + message + opt.postfix;
                        str = replacePlaceholder((this.options.placeholders || []), str, this.internals);
                        if ((opt.logLevel || 0) <= logLevel && (console[opt.logType || 'log'] !== undefined)) {
                            console[opt.logType || 'log'](str);
                        }
                        asyncThings = [];
                        for (_i = 0, _a = opt.transports || []; _i < _a.length; _i++) {
                            transport = _a[_i];
                            asyncThings.push(transport.exec(this.internals, str, message));
                        }
                        for (_b = 0, _c = opt.customFunctions || []; _b < _c.length; _b++) {
                            asyncExec = _c[_b];
                            asyncThings.push(asyncExec(str, this.internals, opt));
                        }
                        return [4, Promise.all(asyncThings)];
                    case 1:
                        _d.sent();
                        return [2, str];
                }
            });
        });
    };
    ;
    LogUpTs.prototype.log = function (str, customOptions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.custom(customOptions || {}, { service: 'LOG' }, str, LOGLEVEL.INFO)];
            });
        });
    };
    LogUpTs.prototype.error = function (error, customOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var opt, str;
            return __generator(this, function (_a) {
                opt = this.mergeOptions(customOptions || {});
                opt.logType = 'error';
                str = error instanceof Error ? "" + error.message + ((opt.logStack && error.stack !== undefined) ? '\n' + error.stack : '') : error;
                return [2, this.custom(opt, { service: 'ERROR' }, str, LOGLEVEL.ERROR)];
            });
        });
    };
    LogUpTs.prototype.warn = function (message, customOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var opt;
            return __generator(this, function (_a) {
                opt = this.mergeOptions(customOptions || {});
                opt.logType = 'warn';
                return [2, this.custom(opt, { service: 'WARN' }, message, LOGLEVEL.WARN)];
            });
        });
    };
    LogUpTs.prototype.trace = function (message, customOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var opt;
            return __generator(this, function (_a) {
                opt = this.mergeOptions(customOptions || {});
                opt.logType = 'trace';
                return [2, this.custom(opt, { service: 'TRACE' }, message, LOGLEVEL.TRACE)];
            });
        });
    };
    LogUpTs.prototype.debug = function (message, customOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var opt;
            return __generator(this, function (_a) {
                opt = this.mergeOptions(customOptions || {});
                opt.logType = 'debug';
                return [2, this.custom(opt, { service: 'DEBUG' }, message, LOGLEVEL.DEBUG)];
            });
        });
    };
    LogUpTs.prototype.info = function (str, customOptions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.custom(customOptions || {}, { service: 'INFO' }, str, LOGLEVEL.INFO)];
            });
        });
    };
    return LogUpTs;
}());
export { LogUpTs };
//# sourceMappingURL=logupts.js.map