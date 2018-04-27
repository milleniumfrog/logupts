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
    constructor() {
        this.loguptsOptions = {
            praefix: '{{service}} ',
            postfix: '',
            placeholders: defaultPlaceholders,
            quiet: false,
        };
        this.placeholderVars = {
            activeService: 'LOG'
        };
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

export { Placeholder, defaultPlaceholders, DEBUG, LogUpTs };
