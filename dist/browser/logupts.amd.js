define(['exports'], function (exports) { 'use strict';

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
    let defaultPlaceholders = {
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

    const DEBUG = true;
    class LogUpTs {
        constructor(newLogUpTsOptions = {}) {
            this.loguptsOptions = this.defaultLogUpTsOptions();
            this.placeholderVars = {
                activeService: 'LOG'
            };
            this.loguptsOptions = this.mergeLogUpTsOptions(this.loguptsOptions, newLogUpTsOptions);
        }
        generateString(string) {
            string = string || '';
            let placeholders = this.loguptsOptions.placeholders || {};
            for (let propName in placeholders) {
                let regexDefault = new RegExp(`{{${placeholders[propName].key}}}`, 'gi');
                string = string.replace(regexDefault, placeholders[propName].replace(this.placeholderVars, ''));
            }
            return string;
        }
        static generateString(logupts, string) {
            string = string || '';
            let placeholders = logupts.loguptsOptions.placeholders || {};
            for (let propName in placeholders) {
                let regexDefault = new RegExp(`{{${placeholders[propName].key}}}`, 'gi');
                string = string.replace(regexDefault, placeholders[propName].replace(logupts.placeholderVars, ''));
            }
            return string;
        }
        defaultLogUpTsOptions() {
            return {
                prefix: '{{service}} ',
                postfix: '',
                placeholders: defaultPlaceholders,
                quiet: false,
                transports: [],
                customAsyncExecutions: [],
                customExecutions: [],
            };
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
                let opt = this.copyLotUpTsOptions(this.loguptsOptions);
                for (let propKey in logUpTsOptions) {
                    opt[propKey] = logUpTsOptions[propKey];
                }
                return opt;
            }
        }
        mergeLogUpTsOptions(a, b) {
            let opt = this.copyLotUpTsOptions(a);
            for (let propKey in b) {
                opt[propKey] = b[propKey];
            }
            return opt;
        }
        copyLotUpTsOptions(logUpTsOptions) {
            let opt = this.defaultLogUpTsOptions();
            for (let i in logUpTsOptions) {
                switch (i) {
                    case 'placeholders':
                        let newPlc = {};
                        let p = opt.placeholders || {};
                        let pNew = logUpTsOptions.placeholders || {};
                        for (let i in p) {
                            newPlc[i] = new Placeholder(i, p[i].replaceVar);
                        }
                        for (let i in pNew) {
                            newPlc[i] = new Placeholder(i, pNew[i].replaceVar);
                        }
                        opt.placeholders = newPlc;
                        break;
                    case 'transports':
                        let copyTrans = (opt.transports || []).slice(0);
                        let newTrans = logUpTsOptions.transports || [];
                        for (let i of newTrans) {
                            copyTrans.push(i);
                        }
                        opt.transports = copyTrans;
                        break;
                    case 'customExecutions':
                        let copyExec = (opt.customExecutions || []).slice(0);
                        for (let i of logUpTsOptions.customExecutions || []) {
                            copyExec.push(i);
                        }
                        opt.customExecutions = copyExec;
                        break;
                    case 'customAsyncExecutions':
                        let copyAsyncExec = (opt.customAsyncExecutions || []).slice(0);
                        for (let i of logUpTsOptions.customAsyncExecutions || []) {
                            copyAsyncExec.push(i);
                        }
                        opt.customAsyncExecutions = copyAsyncExec;
                        break;
                    default:
                        opt[i] = logUpTsOptions[i];
                }
            }
            return opt;
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
            let opt = this.mergeLogUpTsOptions(this.loguptsOptions, loguptsOptions);
            this.execInternalOptions(internalOptions);
            let str = opt.prefix + this.mergeStringArray(messages)
                + opt.postfix;
            str = this.generateString(str);
            for (let i of opt.customExecutions || []) {
                i();
            }
            if (!opt.quiet)
                console.log(str);
            if ((opt.transports || []).length === 0 && (opt.customAsyncExecutions || []).length === 0) {
                return str;
            }
            else {
                let promArr = [];
                let tran = opt.transports || [];
                for (let transport of tran) {
                    promArr.push(transport.exec(internalOptions || {}, str));
                }
                for (let asyncTask of opt.customAsyncExecutions || []) {
                    promArr.push(asyncTask());
                }
                return Promise.all(promArr)
                    .then(() => {
                    return str;
                });
            }
        }
        log(loguptsOptions, ...message) {
            let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
            let internalOptions = {
                activeService: "LOG",
                groups: ['ALL', 'LOG']
            };
            return this.internal(opt || {}, internalOptions, message);
        }
        warn(loguptsOptions, ...message) {
            let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
            let internalOptions = {
                activeService: "WARN",
                groups: ['ALL', 'WARN']
            };
            return this.internal(opt || {}, internalOptions, message);
        }
        error(loguptsOptions, ...message) {
            let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
            let internalOptions = {
                activeService: "ERROR",
                groups: ['ALL', 'ERROR']
            };
            return this.internal(opt || {}, internalOptions, message);
        }
        info(loguptsOptions, ...message) {
            let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
            let internalOptions = {
                activeService: "INFO",
                groups: ['ALL', 'INFO']
            };
            return this.internal(opt || {}, internalOptions, message);
        }
        custom(prefix, postfix, loguptsOptions, ...message) {
            let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
            let internalOptions = {
                activeService: "CUSTOM",
                groups: ['ALL', 'CUSTOM', prefix]
            };
            opt.prefix = prefix;
            opt.postfix = postfix;
            return this.internal(opt || {}, internalOptions, message);
        }
    }

    exports.Placeholder = Placeholder;
    exports.defaultPlaceholders = defaultPlaceholders;
    exports.DEBUG = DEBUG;
    exports.LogUpTs = LogUpTs;

    Object.defineProperty(exports, '__esModule', { value: true });

});
