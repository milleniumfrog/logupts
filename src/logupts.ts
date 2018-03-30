///<amd-module name='logupts'/>

declare let define: any;

////////////////////////////////
////// Interfaces //////////////
////////////////////////////////

export interface IPlaceholders {
    [index: string]: {
        replacer?: string;
        replacerFn?: ((param?: string) => string);
        key: string;
    }
}

/**
 * interface für ie Logts Klasse
 * @interface
 */
export interface ILogUpTs {
    [prop: string]: any
    log: (msg: string, options?: ILogUpTsOptions) => string |  Promise<string> |  void;
    error: (msg: string, options?: ILogUpTsOptions) => string |  Promise<string>;
    info: (msg: string, options?: ILogUpTsOptions) => string |  Promise<string>;
    custom: (praefix: string, postfix: string, message: string | Error, options?: ILogUpTsOptions, serviceName?: string) => string |  Promise<string>;
}

/**
 * interface for the Logpath objects
 * @interface 
 */
export interface IPaths {
    identifier: string;
    /** absoluter Pfad */
    path: string;
    fileName: string;
    serviceToLog: Array<string>
}

/**
 * interface for the LogOptions
 * @interface
 */
export interface ILogUpTsOptions {
    [index: string]: any;
    /** only nodejs: Path for the logfile */
    path?: string;
    praefix?: string;
    postfix?: string;
    /** the Placeholders for praefix and postfix */
    placeholders?: IPlaceholders;
    /** log to console or dont */
    quiet?: boolean;
    logFiles?: Array<IPaths>;
}


export class LogUpTs implements ILogUpTs {
    ///// Client und Server ///
    /** 
     * internen optionen des Objekts 
     * @type {ILogUpTsOptions} 
     */
    public logOptions: ILogUpTsOptions;
    public activeService: string;
    private this: any;
    public genDirs: any;
    /**
     * erstelle ein Object des Type Logts
     * @param logOptions {ILogUpTsOptions}
     */
    constructor(logOptions?: ILogUpTsOptions) {
        this.logOptions = {
            placeholders: Placeholders,
            praefix: '{{service(activeService)}} ',
            postfix: '',
            quiet: false,
            logFiles: []
        }
        this.activeService = 'LOG';
        this.this = this;
        if (logOptions)
            this._mergeOptions(logOptions);
        // get all paths
        this.logOptions.logFiles = this.logOptions.logFiles || [];
        let paths: Array<string> = [];
        for (let logFile of this.logOptions.logFiles) {
            paths.push(logFile.path);
        }
        this.genDirs = this.node_generateLogDir(paths);
    };

    /**
     * 
     * @param str {string | undefined} der Platzhalterstring im Angular-stil {{wort}}
     * @returns {string} alle Platzhalter ersetzt 
     * @private
     */
    _generateStringOutOfPlaceholderString(str: string | undefined): string {
        function cUp(param: string) {
            for (let i = 0; i < param.length; ++i) {
                if (param.substr(i, 3) === ')}}')
                    return i;
            }
            throw new Error('didnt close Placeholder');
        }
        if (str === undefined)
            return '';
        else {
            let string: string = str || '';
            let placeholders = this.logOptions.placeholders || {};
            for (let propName in placeholders) {
                // replace defaults
                let regexDefault = new RegExp(`{{${placeholders[propName].key}}}`, 'gi');
                string = string.replace(regexDefault, placeholders[propName].replacer ||  '');
                // replace functions
                let regexFn = new RegExp(`{{${placeholders[propName].key}\((.{0,})\)}}`, 'i');
                while (regexFn.exec(string)) { // falls ein Eintrag gefunden wurde
                    let match = regexFn.exec(string) ||  { index: -1 };
                    let index = match.index;
                    if (index >= 0) { // wenn ein Eintrag gefunden wurde
                        let length1 = `{{${placeholders[propName].key}(`.length;
                        let minIndex = index + length1;
                        let cUpStr = string.substr(minIndex);
                        let fn: ((param?: string) => string) = placeholders[propName].replacerFn || (() => { return "help" });
                        let cUpNumber = cUp(cUpStr)
                        if (cUpNumber === 0) {
                            string = string.replace(regexFn, fn()); // ersetze Platzhalter durch Normalwert
                        } else {
                            if (typeof this.this[string.substr(minIndex, cUpNumber)] === 'string') {
                                string = string.replace(regexFn, fn(this.this[string.substr(minIndex, cUpNumber)])); // ersetze Wert durch Wert von fn(this[string])
                            } else {
                                string = string.replace(regexFn, fn(string.substr(minIndex, cUpNumber))) // ersetze Wert durch durch Fn(string)
                            }
                        }
                    }
                };
            }
            return string;
        }
    }

    ////////////////////////////////
    ////// Private Funktionen //////
    ////////////////////////////////

    /**
 * merge the options of the Object with new IILogUpTsOptions
 * @param newOptions {ILogUpTsOptions} Die mit einzubringenden Optionen
 * @returns {void} 
 * @private
 */
    _mergeOptions(newOptions: ILogUpTsOptions) {
        for (let key in newOptions) {
            if (typeof this.logOptions[key] === 'object') {
                this._mergeObjects(this.logOptions[key], newOptions[key]);
            } else {
                this.logOptions[key] = newOptions[key];
            }
        }
    }

    /**
     * allgemeinere Form von mergeOptions
     * @param currentObj {any}
     * @param toAddObj {any}
     * @returns {any} currentObj
     * @private
     */
    _mergeObjects(currentObj: any, toAddObj: any) {
        for (let key in toAddObj) {
            currentObj[key] = toAddObj[key];
        }
        return currentObj;
    }

    ////////////////////////////////
    ////// Public Funktionen //////
    ////////////////////////////////

    /**
     * Gebe deine Nachricht mit Praefix und Postfix in der Konsole aus. <br />
     * Falls this.quiet === true dann wird nicht auf die Konsole ausgegben
     * @param message {string} Deine Nachricht
     * @param [options] {ILogUpTsOptions} 
     * @return {string | Promise<string>} Promise nur wenn in Datei gespeichert wird.<br /> Es wird der erstellte String aus Praefix, Nachricht und Postfix zurückgegeben
     * @public
     */
    log(message: string, options?: ILogUpTsOptions): string |  Promise<string> | void {
        this.activeService = 'LOG'; // setze aktivenService auf Log
        let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) + // setze den String zusammen
            message +
            this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
        // log to console
        if (!this.logOptions.quiet)
            console.log(outPut);
        if (runtime !== Runtime.commonjs)
            return outPut;
        // nodejs Teil
        let toPrint = ['ALL', 'LOG'];
        return this.genDirs.then(()=>{return this.node_allFiles(toPrint, outPut)});
    }
    /**
     * Gebe deine Nachricht mit Praefix und Postfix in der Konsole aus als info. <br />
     * Falls this.quiet === true dann wird nicht auf die Konsole ausgegben
     * @param message {string} Deine Nachricht
     * @param [options] {ILogUpTsOptions} 
     * @return {string | Promise<string>} Promise nur wenn in Datei gespeichert wird.<br /> Es wird der erstellte String aus Praefix, Nachricht und Postfix zurückgegeben
     * @public
     */
    error(message: string | Error, options?: ILogUpTsOptions): string |  Promise<string> {
        this.activeService = 'ERROR'; // setze aktivenService auf Log
        let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) + // setze den String zusammen
            (message instanceof Error ? message.message : message) +
            this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
        // log to console
        if (!this.logOptions.quiet)
            console.error(outPut);
        if (runtime !== Runtime.commonjs)
            return outPut;
        // nodejs Teil
        let toPrint = ['ALL', 'ERROR'];
        return this.genDirs.then(()=>this.node_allFiles(toPrint, outPut));
    }

    /**
 * Gebe deine Nachricht mit Praefix und Postfix in der Konsole aus als info. <br />
 * Falls this.quiet === true dann wird nicht auf die Konsole ausgegben
 * @param message {string} Deine Nachricht
 * @param [options] {ILogUpTsOptions} 
 * @return {string | Promise<string>} Promise nur wenn in Datei gespeichert wird.<br /> Es wird der erstellte String aus Praefix, Nachricht und Postfix zurückgegeben
 * @public
 */
    info(message: string | Error, options?: ILogUpTsOptions): string |  Promise<string> {
        this.activeService = 'INFO'; // setze aktivenService auf Log
        let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) + // setze den String zusammen
            (message instanceof Error ? message.message : message) +
            this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
        // log to console
        if (!this.logOptions.quiet)
            console.info(outPut);
        if (runtime !== Runtime.commonjs)
            return outPut;
        // nodejs Teil
        let toPrint = ['ALL', 'INFO'];
        return this.genDirs.then(()=>this.node_allFiles(toPrint, outPut));
    }

    /**
     * 
     * @param praefix {string} add a custom praefix
     * @param postfix {string} add a custom postfix
     * @param message {string} Deine Nachricht
     * @param logoptions 
     */
    custom(praefix: string, postfix: string, message: string | Error, options?: ILogUpTsOptions): string |  Promise<string> {
        this.activeService = 'CUSTOM '; // setze aktivenService auf Log
        let outPut = this._generateStringOutOfPlaceholderString(praefix) + // setze den String zusammen
            (message instanceof Error ? message.message : message) +
            this._generateStringOutOfPlaceholderString(postfix);
        // log to console
        if (!this.logOptions.quiet)
            console.info(outPut);
        // nodejs Teil
        if (runtime !== Runtime.commonjs)
            return outPut;
        let toPrint = ['ALL', 'CUSTOM', praefix];
        return this.genDirs.then(()=>this.node_allFiles(toPrint, outPut));
    }

    ////////////////////////////////
    ////// nur Nodejs //////////////
    ////////////////////////////////

    /**
     * create all Logfiles and fill them with the requestet content
     * @param servicesToLog 
     * @param message 
     * @param depth 
     */
    node_allFiles(servicesToLog: Array<string>, message: string, depth: number = 0): Promise<string> {
        let logFiles = this.logOptions.logFiles ||  [];
        let foundServiceInIPathsServiceToLog: boolean = false;
        // Lade identifier der logPaths
        if (depth < logFiles.length) {
            let idents: Array<string> = []; // erhalte alle Service Identifier
            let k = logFiles[depth];
            for (let l of k.serviceToLog) {
                idents.push(l);
            }
            for (let service of servicesToLog) {
                if (idents.indexOf(service) >= 0) {
                    return this.node_allFiles(servicesToLog, message, ++depth)
                        .then(() => {
                            return this.node_writeToFS(k.path, k.fileName, message)
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
        })
    }
    /**
     * Füge eine Nachricht an eine Datei
     * @param path {string} absolute directory path
     * @param fileName {string} filename containing Placeholders
     * @param message {string} the message that should append
     */
    node_writeToFS(absolutePath: string, fileName: string, message: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fileName = this._generateStringOutOfPlaceholderString(fileName);
            let filePath = absolutePath + '/' + fileName;
            fs.writeFile(filePath, message + '\n', { flag: 'a' }, (error: any) => {
                if (error)
                    reject(error);
                resolve();
            })
        });
    }

    /**
     * erstelle die Pfade aus absoluten Pfadangaben synchron
     * @param toGenPaths 
     */
    node_generateLogDir (toGenPaths: Array<string>): Promise<void> {
        if (toGenPaths.length === 0) 
            return new Promise((resolve) => {resolve();});
        let pathSegments = toGenPaths[0].split(path.seg);
        let pathToCheck = '';
        for (let pathSegment of pathSegments) {
            pathToCheck += '/' + pathSegment;
            if (!fs.existsSync(pathToCheck)) {
                fs.mkdirSync(pathToCheck);
            }
        }
        toGenPaths.shift();
        return this.node_generateLogDir(toGenPaths);
    }

}

enum Runtime {
    commonjs,
    amd,
    default
}
let runtime =
    (typeof module === 'object' && typeof module.exports === "object") ?
        Runtime.commonjs :
        (typeof define === "function" && define.amd) ?
            Runtime.amd :
            Runtime.default;

////////////////////////////////
////// IMPORT //////////////////
////////////////////////////////
let fs: any, path: any;
if (runtime === Runtime.commonjs) {
    fs = require('fs');
    path = require('path');
} else {
    fs = (() => { throw new Error("try to read filesystem on client") });
    path = (() => { throw new Error("try to read Path on client") });
}
/**
 * Die Logts Klasse, logge mit einem Variablen Praefix und Postfix, speichere deinen Log in nodejs in einer Datei
 * Bietet die Service: 
 * LOG, ERROR (ALL für alle)
 * @constructor
 */

export let Placeholders: IPlaceholders = {
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
        replacerFn: (param?: string) => {
            param = param ||  'LOG';
            return '[' + param.toUpperCase() + ']';
        }
    },
    frog: {
        key: 'frog',
        replacer: 'milleniumfrog',
        replacerFn: (param?: string) => {
            param = param ||  'null';
            return 'The frog says ' + param + '!';
        }
    }
}

/**
 * fill up a string with zeros
 * @param length 
 * @param msg 
 */
function fillStrWithZeros(length: number, msg: string) {
    if (length < msg.length) {
        throw new Error('the message is longer than the wished length.');
    } else {
        for (let i = msg.length; i < length; ++i) {
            msg = '0' + msg;
        }
    }
    return msg;
}
