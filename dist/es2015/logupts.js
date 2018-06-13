import { Placeholder, defaultPlaceholders } from './placeholders';
export { Placeholder, defaultPlaceholders };
export class LogUpTs {
    constructor(newLogUpTsOptions = {}, debug = false) {
        this.debug = debug;
        this.loguptsOptions = this.defaultLogUpTsOptions();
        this.placeholderVars = {
            activeService: 'LOG'
        };
        this.loguptsOptions = this.mergeLogUpTsOptions(this.loguptsOptions, newLogUpTsOptions);
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
    static generateString(logupts, string) {
        function countUp(param) {
            for (let i = 0; i < param.length; ++i) {
                if (param.substr(i, 3) === ')}}')
                    return i;
            }
            throw new Error('didnt close Placeholder');
        }
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
//# sourceMappingURL=logupts.js.map