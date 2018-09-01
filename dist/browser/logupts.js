(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.logupts = {})));
}(this, (function (exports) { 'use strict';

    function replaceSingle(key, string, replaceContent, flags, passArguments) {
        flags = flags || 'g';
        let regex = new RegExp(key, flags);
        let res;
        let counter = 0;
        while ((res = regex.exec(string.slice(counter))) !== null) {
            key = key.replace((new RegExp('\\\\', 'g')), '');
            string = string.replace(key, typeof replaceContent === 'function' ? replaceContent('', passArguments) : replaceContent);
            ++counter;
        }
        return string;
    }
    function replaceComplex(complexKeys, string, passArguments) {
        for (let complex of complexKeys) {
            if (complex.keys[1] === undefined) {
                string = complex.called !== true ? replaceSingle(complex.keys[0], string, (args, toPass) => { return complex.replacer('', toPass); }, complex.flags, passArguments) : string;
            }
            else {
                let maxIndex = -1;
                for (let inComplex of complexKeys) {
                    let regex = new RegExp(inComplex.keys[0], inComplex.flags);
                    let res = regex.exec(string);
                    if (res !== null) {
                        maxIndex = maxIndex < res.index ? res.index : maxIndex;
                    }
                }
                if (maxIndex > 0) {
                    string = string.slice(0, maxIndex) + replaceComplex(complexKeys, string.slice(maxIndex));
                }
                let regex = new RegExp(complex.keys[0], complex.flags);
                let res1 = regex.exec(string);
                if (res1 !== null) {
                    regex = new RegExp(complex.keys[1], complex.flags);
                    let res2 = regex.exec(string);
                    let removeEscapesFromKeys = [complex.keys[0].replace((new RegExp('\\\\', 'g')), ''), complex.keys[1].replace((new RegExp('\\\\', 'g')), '')];
                    if (res2 !== null) {
                        string = string.slice(0, res1.index) + complex.replacer(string.slice(res1.index + removeEscapesFromKeys[0].length, res2.index), passArguments) + string.slice(res2.index + removeEscapesFromKeys[1].length);
                    }
                }
            }
        }
        return string;
    }

    const DefaultPlaceholders = [
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

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const defaultOptions = {
        prefix: '{{service}} ',
        postfix: '',
        placeholders: DefaultPlaceholders,
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
            this.options = this.mergeOptions(customOptions, defaultOptions);
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
                str = replaceComplex((this.options.placeholders || []), str, this.internals);
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

    exports.defaultOptions = defaultOptions;
    exports.LogUpTs = LogUpTs;
    exports.DefaultPlaceholders = DefaultPlaceholders;
    exports.replacePlaceholder = replaceComplex;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=logupts.js.map
