class Placeholder {
    constructor(key, replacerOrFn = "") {
        this.key = key;
        if (typeof replacerOrFn === 'string') {
            this.replacer = replacerOrFn;
            this.replacerFn = Placeholder.defaultFn;
        }
        else {
            this.replacerFn = replacerOrFn;
            this.replacer = Placeholder.default;
        }
    }
    static defaultFn(param) {
        return ("this placeholder doesn´t supports functions");
    }
    static onlyString(param) {
        if ((typeof param).toLowerCase() !== 'string')
            throw new Error("this placeholder doesn´t supports functions without a string as param");
    }
}
Placeholder.default = "this placeholder doesn´t supports no Function";
let Placeholders = {
    date: new Placeholder('date', `${fillStrWithZeros(2, String((new Date()).getDate()))}`),
    day: new Placeholder('day', `${fillStrWithZeros(2, String((new Date()).getDay()))}`),
    month: new Placeholder('month', `${fillStrWithZeros(2, String((new Date()).getMonth() + 1))}`),
    fullYear: new Placeholder('fullYear', `${(new Date()).getFullYear()}`),
    year: new Placeholder('year', `${(new Date()).getFullYear()}`),
    hours: new Placeholder('hours', `${fillStrWithZeros(2, String((new Date()).getHours()))}`),
    minutes: new Placeholder('minutes', `${fillStrWithZeros(2, String((new Date()).getMinutes()))}`),
    seconds: new Placeholder('seconds', `${fillStrWithZeros(2, String((new Date()).getSeconds()))}`),
    frog: new Placeholder('frog', 'milleniumfrog'),
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

var Runtime;
(function (Runtime) {
    Runtime[Runtime["commonjs"] = 0] = "commonjs";
    Runtime[Runtime["amd"] = 1] = "amd";
    Runtime[Runtime["default"] = 2] = "default";
})(Runtime || (Runtime = {}));
let runtime = (typeof module === 'object' && typeof module.exports === "object") ?
    Runtime.commonjs :
    (typeof define === "function" && define.amd) ?
        Runtime.amd :
        Runtime.default;
let fs, path;
if (runtime === Runtime.commonjs) {
    fs = require('fs');
    path = require('path');
}
else {
    fs = (() => { });
    path = (() => { });
}
class LogUpTs {
    constructor(logOptions) {
        this.placeholderVars = {};
        this.logOptions = {
            placeholders: Placeholders,
            praefix: '{{service()}} ',
            postfix: '',
            quiet: false,
            logFiles: [],
            writeToFile: false,
            writeToFileSystem: false
        };
        this.placeholderVars.activeService = 'LOG';
        this.this = this;
        if (logOptions)
            this._mergeOptions(logOptions);
        this.logOptions.logFiles = this.logOptions.logFiles || [];
        let paths = [];
        for (let logFile of this.logOptions.logFiles) {
            paths.push(logFile.path);
        }
        this.genDirs = this.node_generateLogDir(paths);
    }
    ;
    _generateStringOutOfPlaceholderString(str) {
        function cUp(param) {
            for (let i = 0; i < param.length; ++i) {
                if (param.substr(i, 3) === ')}}')
                    return i;
            }
            throw new Error('didnt close Placeholder');
        }
        if (str === undefined)
            return '';
        else {
            let string = str || '';
            let placeholders = this.logOptions.placeholders || {};
            for (let propName in placeholders) {
                let regexDefault = new RegExp(`{{${placeholders[propName].key}}}`, 'gi');
                string = string.replace(regexDefault, placeholders[propName].replacer || '');
                let regexFn = new RegExp(`{{${placeholders[propName].key}\((.{0,})\)}}`, 'i');
                while (regexFn.exec(string)) {
                    let match = regexFn.exec(string) || { index: -1 };
                    let index = match.index;
                    if (index >= 0) {
                        let length1 = `{{${placeholders[propName].key}(`.length;
                        let minIndex = index + length1;
                        let cUpStr = string.substr(minIndex);
                        let fn = placeholders[propName].replacerFn || (() => { return "help"; });
                        let cUpNumber = cUp(cUpStr);
                        if (cUpNumber === 0) {
                            string = string.replace(regexFn, fn(this.this.placeholderVars));
                        }
                        else {
                            if (typeof this.this[string.substr(minIndex, cUpNumber)] === 'string') {
                                string = string.replace(regexFn, fn(this.this[string.substr(minIndex, cUpNumber)]));
                            }
                            else {
                                string = string.replace(regexFn, fn(string.substr(minIndex, cUpNumber)));
                            }
                        }
                    }
                }
            }
            return string;
        }
    }
    _mergeOptions(newOptions) {
        for (let key in newOptions) {
            if (typeof this.logOptions[key] === 'object') {
                this._mergeObjects(this.logOptions[key], newOptions[key]);
            }
            else {
                this.logOptions[key] = newOptions[key];
            }
        }
    }
    _mergeObjects(currentObj, toAddObj) {
        for (let key in toAddObj) {
            currentObj[key] = toAddObj[key];
        }
        return currentObj;
    }
    log(message, options) {
        let opt = options || this.logOptions;
        return this.internal(this.logOptions.praefix || '{{service()}}', this.logOptions.postfix || '', 'LOG', ['ALL', 'LOG'], message, options, 'log');
    }
    error(message, options) {
        return this.internal(this.logOptions.praefix || '{{service()}}', this.logOptions.postfix || '', 'ERROR', ['ALL', 'ERROR'], message instanceof Error ? message.message : message, options, 'error');
    }
    warn(message, options) {
        return this.internal(this.logOptions.praefix || '{{service()}}', this.logOptions.postfix || '', 'WARN', ['ALL', 'WARN'], message instanceof Error ? message.message : message, options, 'warn');
    }
    info(message, options) {
        return this.internal(this.logOptions.praefix || '{{service()}}', this.logOptions.postfix || '', 'INFO', ['ALL', 'INFO'], message, options, 'info');
    }
    custom(praefix, postfix, message, options, activeService) {
        let toPrint = ['ALL', 'CUSTOM', praefix];
        return this.internal(praefix, postfix, activeService || 'CUSTOM', toPrint, message);
    }
    internal(praefix, postfix, activeService, toPrint, message, options, consoleFunc = 'log') {
        let opt = options || this.logOptions;
        this.placeholderVars.activeService = activeService;
        let outPut = praefix + message + postfix;
        outPut = this._generateStringOutOfPlaceholderString(outPut);
        if (!opt.quiet) {
            switch (consoleFunc) {
                case 'warn':
                    console.warn(outPut);
                    break;
                case 'error':
                    console.error(outPut);
                    break;
                case 'info':
                    console.info(outPut);
                    break;
                default:
                    console.log(outPut);
            }
        }
        if (runtime !== Runtime.commonjs || !opt.writeToFileSystem)
            return outPut;
        else
            return this.genDirs.then(() => this.node_allFiles(toPrint, outPut));
    }
    node_allFiles(servicesToLog, message, depth = 0) {
        let logFiles = this.logOptions.logFiles || [];
        if (depth < logFiles.length) {
            let idents = [];
            let k = logFiles[depth];
            for (let l of k.serviceToLog) {
                idents.push(l);
            }
            for (let service of servicesToLog) {
                if (idents.indexOf(service) >= 0) {
                    return this.node_allFiles(servicesToLog, message, ++depth)
                        .then(() => {
                        return this.node_writeToFS(k.path, k.fileName, message);
                    })
                        .then(() => {
                        return message;
                    });
                }
            }
            return this.node_allFiles(servicesToLog, message, ++depth);
        }
        return new Promise((resolve, reject) => {
            resolve(message);
        });
    }
    node_writeToFS(absolutePath, fileName, message) {
        return new Promise((resolve, reject) => {
            fileName = this._generateStringOutOfPlaceholderString(fileName);
            let filePath = absolutePath + '/' + fileName;
            fs.writeFile(filePath, message + '\n', { flag: 'a' }, (error) => {
                if (error)
                    reject(error);
                resolve();
            });
        });
    }
    node_generateLogDir(toGenPaths) {
        if (toGenPaths.length === 0)
            return new Promise((resolve, reject) => { resolve(); });
        let pathSegments = toGenPaths[0].split(path.sep);
        let pathToCheck = '';
        for (let pathSegment of pathSegments) {
            if (pathSegment === '/' || pathSegment === '')
                continue;
            pathToCheck += '/' + pathSegment;
            if (!fs.existsSync(pathToCheck)) {
                fs.mkdirSync(pathToCheck);
            }
        }
        toGenPaths.shift();
        return this.node_generateLogDir(toGenPaths);
    }
}

export { Runtime, LogUpTs, Placeholders, Placeholder };
