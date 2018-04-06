import { Placeholders, Placeholder } from './placeholders';
// reexport
export { Placeholders, Placeholder } from './placeholders';



declare let define: any;
declare let module: any;
declare let require: any;

export enum Runtime {
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
    fs = (() => { });
    path = (() => { });
}
////////////////////////////////
////// Interfaces //////////////
////////////////////////////////


/**
 * interface for the LogUpTs class and reimplementations
 * @interface
 */
export interface ILogUpTs {
    [prop: string]: any
    log: (msg: string, options?: ILogUpTsOptions) => string | Promise<string> | void;
    error: (msg: string, options?: ILogUpTsOptions) => string | Promise<string>;
    info: (msg: string, options?: ILogUpTsOptions) => string | Promise<string>;
    custom: (praefix: string, postfix: string, message: string, options?: ILogUpTsOptions, serviceName?: string) => string | Promise<string>;
}

/**
 * interface for the Logpath objects
 * where and what shouldt get written in the logfiles
 * @interface 
 */
export interface IPaths {
    identifier: string;
    /** absolute path */
    path: string;
    fileName: string;
    serviceToLog: Array<string>
}

/**
 * configure logupts
 * @interface
 */
export interface ILogUpTsOptions {
    [index: string]: any;
    /** configure the praefix 
     */
    praefix?: string;
    /**configure the postfix 
     */
    postfix?: string;
    /** a list of all placeholders */
    placeholders?: { [str: string]: Placeholder };
    /** log to console or dont */
    quiet?: boolean;
    /** configure what and where should be saved */
    logFiles?: Array<IPaths>;
    /** @deprecated use writeToFileSystem instead */
    writeToFile?: boolean;
    /** activate writing the in logFiles configured files to filesystem (nodejs only) */
    writeToFileSystem?: boolean;
}


export class LogUpTs implements ILogUpTs {
    /** 
     * internal options
     * @type {ILogUpTsOptions} 
     */
    public logOptions: ILogUpTsOptions;
    /**
     * variables that get passed to the placeholderfunctions
     */
    public placeholderVars: any;
    /**
     * make this accessable in ts without a type
     */
    private this: any;
    public genDirs: any;
    /**
     * erstelle ein Object des Type Logts
     * @param logOptions {ILogUpTsOptions}
     */
    constructor(logOptions?: ILogUpTsOptions) {
        this.placeholderVars = {};
        this.logOptions = {
            placeholders: Placeholders,
            praefix: '{{service()}} ',
            postfix: '',
            quiet: false,
            logFiles: [],
            /** @deprecated use writeToFileSystem instead */
            writeToFile: false,
            writeToFileSystem: false
        }
        this.placeholderVars.activeService = 'LOG';
        this.this = this;
        if (logOptions)
            this._mergeOptions(logOptions);
        // get all paths
        this.logOptions.logFiles = this.logOptions.logFiles ||  [];
        let paths: Array<string> = [];
        for (let logFile of this.logOptions.logFiles) {
            paths.push(logFile.path);
        }
        // generate all files
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
                string = string.replace(regexDefault, placeholders[propName].replacer || '');
                // replace functions
                let regexFn = new RegExp(`{{${placeholders[propName].key}\((.{0,})\)}}`, 'i');
                while (regexFn.exec(string)) { // falls ein Eintrag gefunden wurde
                    let match = regexFn.exec(string) || { index: -1 };
                    let index = match.index;
                    if (index >= 0) { // wenn ein Eintrag gefunden wurde
                        let length1 = `{{${placeholders[propName].key}(`.length;
                        let minIndex = index + length1;
                        let cUpStr = string.substr(minIndex);
                        let fn: ((param?: string) => string) = placeholders[propName].replacerFn || (() => { return "help" });
                        let cUpNumber = cUp(cUpStr)
                        if (cUpNumber === 0) {
                            string = string.replace(regexFn, fn(this.this.placeholderVars)); // ersetze Platzhalter durch Normalwert
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
    log(message: string, options?: ILogUpTsOptions): string | Promise<string> | void {
        let opt = options || this.logOptions;
        return this.internal(
            this.logOptions.praefix || '{{service()}}',
            this.logOptions.postfix || '',
            'LOG',
            ['ALL', 'LOG'],
            message,
            options, 'log'
        )
    }
    /**
     * Log a errormessage, generate a String with Prefix and Postfix, write
     * @param message {string} Deine Nachricht
     * @param [options] {ILogUpTsOptions} 
     * @return {string | Promise<string>} Promise nur wenn in Datei gespeichert wird.<br /> Es wird der erstellte String aus Praefix, Nachricht und Postfix zurückgegeben
     * @public
     */
    error(message: string | Error, options?: ILogUpTsOptions): string | Promise<string> {
        return this.internal(
            this.logOptions.praefix || '{{service()}}',
            this.logOptions.postfix || '',
            'ERROR',
            ['ALL', 'ERROR'],
            message instanceof Error ? message.message : message,
            options, 'error'
        )
    }

    /**
   * Log a errormessage, generate a String with Prefix and Postfix, write
   * @param message {string} Deine Nachricht
   * @param [options] {ILogUpTsOptions} 
   * @return {string | Promise<string>} Promise nur wenn in Datei gespeichert wird.<br /> Es wird der erstellte String aus Praefix, Nachricht und Postfix zurückgegeben
   * @public
   */
    warn(message: string |  Error, options?: ILogUpTsOptions): string | Promise<string> {
        return this.internal(
            this.logOptions.praefix || '{{service()}}',
            this.logOptions.postfix || '',
            'WARN',
            ['ALL', 'WARN'],
            message instanceof Error ? message.message : message,
            options, 'warn'
        )
    }

    /**
 * Gebe deine Nachricht mit Praefix und Postfix in der Konsole aus als info. <br />
 * Falls this.quiet === true dann wird nicht auf die Konsole ausgegben
 * @param message {string} Deine Nachricht
 * @param [options] {ILogUpTsOptions} 
 * @return {string | Promise<string>} Promise nur wenn in Datei gespeichert wird.<br /> Es wird der erstellte String aus Praefix, Nachricht und Postfix zurückgegeben
 * @public
 */
    info(message: string, options?: ILogUpTsOptions): string | Promise<string> {
        return this.internal(
            this.logOptions.praefix || '{{service()}}',
            this.logOptions.postfix || '',
            'INFO',
            ['ALL', 'INFO'],
            message, options, 'info'
        )
    }

    /**
     * 
     * @param praefix {string} add a custom praefix
     * @param postfix {string} add a custom postfix
     * @param message {string} Deine Nachricht
     * @param logoptions 
     */
    custom(praefix: string, postfix: string, message: string, options?: ILogUpTsOptions, activeService?: string): string | Promise<string> {
        let toPrint = ['ALL', 'CUSTOM', praefix];
        return this.internal(praefix, postfix, activeService || 'CUSTOM',
            toPrint, message);
    }

    // internal custom function
    internal(praefix: string, postfix: string, activeService: string, toPrint: Array<string>,
        message: string, options?: ILogUpTsOptions, consoleFunc: string = 'log'): string | Promise<string> {
        let opt: ILogUpTsOptions = options || this.logOptions;
        // set activeservice
        this.placeholderVars.activeService = activeService;
        // merge praefix message and postfix
        let outPut = praefix + message + postfix;
        outPut = this._generateStringOutOfPlaceholderString(outPut);
        // log to console
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
        // return a string if runtime is not nodejs and if the writeToFileSystem is false
        if (runtime !== Runtime.commonjs || !opt.writeToFileSystem)
            return outPut;
        else
            return this.genDirs.then(() => this.node_allFiles(toPrint, outPut));
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
        let logFiles = this.logOptions.logFiles || [];
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
    node_generateLogDir(toGenPaths: Array<string>): Promise<void> {
        if (toGenPaths.length === 0)
            return new Promise((resolve, reject) => { resolve(); });
        let pathSegments = toGenPaths[0].split(path.sep);
        let pathToCheck = '';
        for (let pathSegment of pathSegments) {
            if (pathSegment === '/' ||  pathSegment === '') continue;
            pathToCheck += '/' + pathSegment;
            if (!fs.existsSync(pathToCheck)) {
                fs.mkdirSync(pathToCheck);
            }
        }
        toGenPaths.shift();
        return this.node_generateLogDir(toGenPaths);
    }

}
