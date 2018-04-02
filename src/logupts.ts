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
    fs = (() => {});
    path = (() => {});
}
////////////////////////////////
////// Interfaces //////////////
////////////////////////////////


/**
 * interface für ie Logts Klasse
 * @interface
 */
export interface ILogUpTs {
    [prop: string]: any
    log: (msg: string, options?: ILogUpTsOptions) => string |  Promise<string> |  void;
    error: (msg: string, options?: ILogUpTsOptions) => string |  Promise<string>;
    info: (msg: string, options?: ILogUpTsOptions) => string |  Promise<string>;
    custom: (praefix: string, postfix: string, message: string, options?: ILogUpTsOptions, serviceName?: string) => string |  Promise<string>;
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
    placeholders?: {[str: string]: Placeholder};
    /** log to console or dont */
    quiet?: boolean;
    logFiles?: Array<IPaths>;
    writeToFileSystem: boolean;
}


export class LogUpTs implements ILogUpTs {
    ///// Client und Server ///
    /** 
     * internen optionen des Objekts 
     * @type {ILogUpTsOptions} 
     */
    public logOptions: ILogUpTsOptions;
    public placeholderVars: any;
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
        this.logOptions.logFiles = this.logOptions.logFiles || [];
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
    log(message: string, options?: ILogUpTsOptions): string |  Promise<string> | void {
        this.placeholderVars.activeService = 'LOG'; // setze aktivenService auf Log
        let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) + // setze den String zusammen
            message +
            this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
        // log to console
        if (!this.logOptions.quiet)
            console.log(outPut);
        if (runtime !== Runtime.commonjs || !this.logOptions.writeToFileSystem)
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
        this.placeholderVars.activeService = 'ERROR'; // setze aktivenService auf Log
        let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) + // setze den String zusammen
            (message instanceof Error ? message.message : message) +
            this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
        // log to console
        if (!this.logOptions.quiet)
            console.error(outPut);
        if (runtime !== Runtime.commonjs || !this.logOptions.writeToFileSystem)
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
    info(message: string, options?: ILogUpTsOptions): string |  Promise<string> {
        this.placeholderVars.activeService = 'INFO'; // setze aktivenService auf Log
        let outPut = this._generateStringOutOfPlaceholderString(this.logOptions.praefix) + // setze den String zusammen
            message +
            this._generateStringOutOfPlaceholderString(this.logOptions.postfix);
        // log to console
        if (!this.logOptions.quiet)
            console.info(outPut);
        if (runtime !== Runtime.commonjs || !this.logOptions.writeToFileSystem)
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
    custom(praefix: string, postfix: string, message: string, options?: ILogUpTsOptions): string |  Promise<string> {
        this.placeholderVars.activeService = 'CUSTOM '; // setze aktivenService auf Log
        let outPut = this._generateStringOutOfPlaceholderString(praefix) + // setze den String zusammen
             message +
            this._generateStringOutOfPlaceholderString(postfix);
        // log to console
        if (!this.logOptions.quiet)
            console.log(outPut);
        // nodejs Teil
        if (runtime !== Runtime.commonjs || !this.logOptions.writeToFileSystem)
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
            return new Promise((resolve, reject) => {resolve();});
        let pathSegments = toGenPaths[0].split(path.sep);
        let pathToCheck = '';
        for (let pathSegment of pathSegments) {
            if (pathSegment === '/' || pathSegment === '') continue;
            pathToCheck += '/' + pathSegment;
            if (!fs.existsSync(pathToCheck)) {
                fs.mkdirSync(pathToCheck);
            }
        }
        toGenPaths.shift();
        return this.node_generateLogDir(toGenPaths);
    }

}
