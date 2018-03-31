(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Runtime;
    (function (Runtime) {
        Runtime[Runtime["commonjs"] = 0] = "commonjs";
        Runtime[Runtime["amd"] = 1] = "amd";
        Runtime[Runtime["default"] = 2] = "default";
    })(Runtime = exports.Runtime || (exports.Runtime = {}));
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
            this.logOptions = {
                placeholders: exports.Placeholders,
                praefix: '{{service(activeService)}} ',
                postfix: '',
                quiet: false,
                logFiles: [],
                writeToFile: false
            };
            this.activeService = 'LOG';
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
                                string = string.replace(regexFn, fn());
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
                    ;
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
            this.activeService = 'LOG';
            let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) +
                message +
                this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
            if (!this.logOptions.quiet)
                console.log(outPut);
            if (runtime !== Runtime.commonjs || !this.logOptions.writeToFile)
                return outPut;
            let toPrint = ['ALL', 'LOG'];
            return this.genDirs.then(() => { return this.node_allFiles(toPrint, outPut); });
        }
        error(message, options) {
            this.activeService = 'ERROR';
            let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) +
                (message instanceof Error ? message.message : message) +
                this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
            if (!this.logOptions.quiet)
                console.error(outPut);
            if (runtime !== Runtime.commonjs || !this.logOptions.writeToFile)
                return outPut;
            let toPrint = ['ALL', 'ERROR'];
            return this.genDirs.then(() => this.node_allFiles(toPrint, outPut));
        }
        info(message, options) {
            this.activeService = 'INFO';
            let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) +
                message +
                this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
            if (!this.logOptions.quiet)
                console.info(outPut);
            if (runtime !== Runtime.commonjs || !this.logOptions.writeToFile)
                return outPut;
            let toPrint = ['ALL', 'INFO'];
            return this.genDirs.then(() => this.node_allFiles(toPrint, outPut));
        }
        custom(praefix, postfix, message, options) {
            this.activeService = 'CUSTOM ';
            let outPut = this._generateStringOutOfPlaceholderString(praefix) +
                message +
                this._generateStringOutOfPlaceholderString(postfix);
            if (!this.logOptions.quiet)
                console.log(outPut);
            if (runtime !== Runtime.commonjs || !this.logOptions.writeToFile)
                return outPut;
            let toPrint = ['ALL', 'CUSTOM', praefix];
            return this.genDirs.then(() => this.node_allFiles(toPrint, outPut));
        }
        node_allFiles(servicesToLog, message, depth = 0) {
            let logFiles = this.logOptions.logFiles || [];
            let foundServiceInIPathsServiceToLog = false;
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
    exports.LogUpTs = LogUpTs;
    exports.Placeholders = {
        day: {
            key: 'day',
            replacer: fillStrWithZeros(2, `${(new Date()).getDate()}`)
        },
        month: {
            key: 'month',
            replacer: fillStrWithZeros(2, `${(new Date()).getMonth() + 1}`)
        },
        year: {
            key: 'year',
            replacer: fillStrWithZeros(4, `${(new Date()).getFullYear()}`)
        },
        service: {
            key: 'service',
            replacerFn: (param) => {
                param = param || 'LOG';
                return '[' + param.toUpperCase() + ']';
            }
        },
        frog: {
            key: 'frog',
            replacer: 'milleniumfrog',
            replacerFn: (param) => {
                param = param || 'null';
                return 'The frog says ' + param + '!';
            }
        }
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
});
//# sourceMappingURL=logupts.js.map