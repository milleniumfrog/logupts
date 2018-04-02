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
    date: new Placeholder('date', `${(new Date()).getDate()}`),
    day: new Placeholder('day', `${(new Date()).getDay()}`),
    month: new Placeholder('month', `${(new Date()).getMonth()}`),
    fullYear: new Placeholder('date', `${(new Date()).getFullYear()}`),
    hours: new Placeholder('date', `${(new Date()).getHours()}`),
    minutes: new Placeholder('date', `${(new Date()).getMinutes()}`),
    seconds: new Placeholder('date', `${(new Date()).getSeconds()}`),
    service: new Placeholder('service', ((placeholderVars) => {
        return `[${placeholderVars.activeService}]`;
    }))
};
//# sourceMappingURL=placeholders.js.map

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
        this.placeholderVars.activeService = 'LOG';
        let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) +
            message +
            this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
        if (!this.logOptions.quiet)
            console.log(outPut);
        if (runtime !== Runtime.commonjs || !this.logOptions.writeToFileSystem)
            return outPut;
        let toPrint = ['ALL', 'LOG'];
        return this.genDirs.then(() => { return this.node_allFiles(toPrint, outPut); });
    }
    error(message, options) {
        this.placeholderVars.activeService = 'ERROR';
        let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) +
            (message instanceof Error ? message.message : message) +
            this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
        if (!this.logOptions.quiet)
            console.error(outPut);
        if (runtime !== Runtime.commonjs || !this.logOptions.writeToFileSystem)
            return outPut;
        let toPrint = ['ALL', 'ERROR'];
        return this.genDirs.then(() => this.node_allFiles(toPrint, outPut));
    }
    info(message, options) {
        this.placeholderVars.activeService = 'INFO';
        let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) +
            message +
            this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
        if (!this.logOptions.quiet)
            console.info(outPut);
        if (runtime !== Runtime.commonjs || !this.logOptions.writeToFileSystem)
            return outPut;
        let toPrint = ['ALL', 'INFO'];
        return this.genDirs.then(() => this.node_allFiles(toPrint, outPut));
    }
    custom(praefix, postfix, message, options) {
        this.placeholderVars.activeService = 'CUSTOM ';
        let outPut = this._generateStringOutOfPlaceholderString(praefix) +
            message +
            this._generateStringOutOfPlaceholderString(postfix);
        if (!this.logOptions.quiet)
            console.log(outPut);
        if (runtime !== Runtime.commonjs || !this.logOptions.writeToFileSystem)
            return outPut;
        let toPrint = ['ALL', 'CUSTOM', praefix];
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
            return new Promise((resolve) => { resolve(); });
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
//# sourceMappingURL=logupts.js.map

export { Runtime, LogUpTs };
