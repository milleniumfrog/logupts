import { Placeholder, defaultPlaceholders } from './placeholders';
export { Placeholder, defaultPlaceholders };
export const DEBUG = true;
export class LogUpTs {
    constructor(newLogUpTsOptions = {}) {
        this.loguptsOptions = {
            praefix: '{{service}} ',
            postfix: '',
            placeholders: defaultPlaceholders,
            quiet: false,
        };
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
            let opt = this.deepClone(this.loguptsOptions);
            for (let propKey in logUpTsOptions) {
                opt[propKey] = logUpTsOptions[propKey];
            }
            return opt;
        }
    }
    mergeLogUpTsOptions(a, b) {
        let opt = this.deepClone(a);
        for (let propKey in b) {
            opt[propKey] = b[propKey];
        }
        return opt;
    }
    deepClone(obj) {
        let clone = {};
        for (let i in obj) {
            if (typeof (obj[i]) == "object" && obj[i] != null) {
                clone[i] = this.deepClone(obj[i]);
            }
            else {
                clone[i] = obj[i];
            }
        }
        return clone;
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
        let str = opt.praefix + this.mergeStringArray(messages)
            + opt.postfix;
        str = this.generateString(str);
        if (!opt.quiet)
            console.log(str);
        if ((opt.transports || []).length === 0 && (opt.customAsyncExecutions || []).length === 0) {
            return str;
        }
        else {
            let promArr = [];
            for (let transport of opt.transports || []) {
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
    custom(praefix, postfix, loguptsOptions, ...message) {
        let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
        let internalOptions = {
            activeService: "INFO",
            groups: ['ALL', 'CUSTOM', praefix]
        };
        opt.praefix = praefix;
        opt.postfix = postfix;
        return this.internal(opt || {}, internalOptions, message);
    }
}
//# sourceMappingURL=logupts.js.map