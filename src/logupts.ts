// import placeholders
import { Placeholder, defaultPlaceholders } from './placeholders';
// export the Placeholderclass
export { Placeholder, defaultPlaceholders }
// export debuglevel for development
export const DEBUG = true;

/**
 * configure your LogUpTs object with this options
 */
export interface LogUpTsOptions {
    [index: string]: any;
    /** set a default prefix */
    praefix?: string;
    /** set a default postfix */
    postfix?: string;
    /** set/configure the placeholders */
    placeholders?: { [str: string]: Placeholder };
    /** quiet mode -- diable all console.logs */
    quiet?: boolean;
    /** transport layer */
    transports?: Transport[];
    /** executes in internal function */
    customExecutions?: ((...params: any[]) => any)[];
    /** executes in internal function, => always returns a promise */
    customAsyncExecutions?: ((...params: any[]) => Promise<any>)[]
}

export type text = Array<string> | string;

export interface InternalLogUpTsOptions {
    activeService?: string;
}

export interface Transport {
    exec: (transportOptions: InternalLogUpTsOptions, str: string) => Promise<any>;
    key: string;
}

export class LogUpTs {
    protected loguptsOptions: LogUpTsOptions;
    protected placeholderVars: any;
    constructor(newLogUpTsOptions: LogUpTsOptions = {}) {
        this.loguptsOptions = this.defaultLogUpTsOptions();
        this.placeholderVars = {
            activeService: 'LOG'
        }
        this.loguptsOptions = this.mergeLogUpTsOptions(this.loguptsOptions, newLogUpTsOptions);
    }

    public generateString(string: string): string {
        function countUp(param: string) {
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
            // DEBUG console.log(placeholders[propName]);
            string = string.replace(regexDefault, placeholders[propName].replace(this.placeholderVars, ''))
        }

        return string;
    }

    protected defaultLogUpTsOptions():LogUpTsOptions {
        return {
            praefix: '{{service}} ',
            postfix: '',
            placeholders: defaultPlaceholders,
            quiet: false,
            transports: [],
            customAsyncExecutions: [],
            customExecutions: [],
        };
    }

    /** get a text Array 
     * @param {text[]} textArr 
     * @returns {string}
    */
    protected mergeStringArray(textArr: text[]): string {
        let str = '';
        for (let strPart of textArr) {
            if (typeof strPart !== 'string') {
                strPart = this.mergeStringArray(strPart);
            }
            str += strPart;
        }
        return str;
    }

    protected prepareLogUpTsOptions(logUpTsOptions: LogUpTsOptions | string | undefined, messageArr?: text[]): LogUpTsOptions {
        // if its a string 
        if (typeof logUpTsOptions === 'string') {
            if (messageArr === undefined)
                throw new TypeError('if loguptsOptions is a string then the messageArr is needed');
            messageArr.unshift(logUpTsOptions);
            return this.loguptsOptions;
        // it its undefined
        } else if (logUpTsOptions === undefined) {
            if (messageArr === undefined)
                throw new TypeError('if loguptsOptions is a string then the messageArr is needed');
            messageArr.unshift('');
            return this.loguptsOptions;
        // if its a LogupTsOptions Object
        } else {
            let opt: LogUpTsOptions = this.copyLotUpTsOptions(this.loguptsOptions);
            for (let propKey in logUpTsOptions) {
                opt[propKey] = logUpTsOptions[propKey];
            }
            return opt;
        }
    }

    /**
     * 
     * @param a 
     * @param b should be a logOptions object that gets destroyed or not used
     */
    protected mergeLogUpTsOptions(a: LogUpTsOptions, b: LogUpTsOptions): LogUpTsOptions {
        let opt: LogUpTsOptions = this.copyLotUpTsOptions(a);
        for (let propKey in b) {
            opt[propKey] = b[propKey];
        }
        return opt;
    }

    /**
     * copy loguptsOptions
     * @param logUpTsOptions 
     */
    protected copyLotUpTsOptions(logUpTsOptions: LogUpTsOptions): LogUpTsOptions {
        let opt: LogUpTsOptions = this.defaultLogUpTsOptions();
        for (let i in logUpTsOptions) {
            switch(i) {
                case 'placeholders':
                    let newPlc: any = {};
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
                    let copyTrans: Transport[] = (opt.transports || []).slice(0);
                    let newTrans = logUpTsOptions.transports || [];
                    for (let i of newTrans) {
                        copyTrans.push(i);
                    }
                    opt.transports = copyTrans;
                    break;
                case 'customExecutions':
                    let copyExec = (opt.customExecutions || []).slice(0);
                    for (let i of logUpTsOptions.customExecutions || []) {
                        copyExec.push(i);
                    }
                    opt.customExecutions = copyExec;
                    break;
                case 'customAsyncExecutions':
                    let copyAsyncExec = (opt.customAsyncExecutions || []).slice(0);
                    for (let i of logUpTsOptions.customAsyncExecutions || []) {
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

    protected execInternalOptions(internalOptions: InternalLogUpTsOptions) {
        for(let key in internalOptions) {
            switch(key){
                case "activeService":
                    this.placeholderVars.activeService = internalOptions.activeService;
                    break;
            }
        }
    }

    /**
     * do the magic in internal <br />
     * - transforms the string <br /> 
     * - logs to console <br />
     * - start transport layer
     * @param {LogUpTsOptions} loguptsOptions
     * @param {InternalLogUpTsOptions} internalOptions 
     * @param {text} messages
     * @returns {string | Promise<string>} 
     */
    public internal(loguptsOptions: LogUpTsOptions, internalOptions :InternalLogUpTsOptions, ...messages:  text[]): string | Promise<string> {
        // merge options parameter with internals
        let opt = this.mergeLogUpTsOptions(this.loguptsOptions, loguptsOptions);
        // execute something if its 
        this.execInternalOptions(internalOptions);
        // create string
        let str = opt.praefix + this.mergeStringArray(messages)
            + opt.postfix;
        str = this.generateString(str);
        // execute sync Functions
        for (let i of opt.customExecutions || []) {
            i();
        }
        // log to console
        if (!opt.quiet)
            console.log(str);
        if ((opt.transports || []).length === 0 && (opt.customAsyncExecutions || []).length === 0){
            return str;
        }
        else {
            // collect all Promises in one Array
            let promArr: Promise<any>[] = [];
            let tran: Transport[] = opt.transports || [];
            // add Transport promises
            for(let transport of tran) {
                promArr.push(transport.exec(internalOptions || {}, str))
            }
            // add async Task promises
            for(let asyncTask of opt.customAsyncExecutions || []) {
                promArr.push(asyncTask());
            }
            // execute all Promises
            return Promise.all(promArr)
            .then(() => {
                return str;
            });
        }
    }

    /**
     * console.log aequivalent
     * @param loguptsOptions 
     * @param message 
     */
    public log (loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string> {
        let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
        let internalOptions = {
            activeService: "LOG",
            groups: ['ALL', 'LOG']
        };
        return this.internal(opt || {}, internalOptions, message);
    }

    /**
     * console.warn aequivalent
     * @param loguptsOptions 
     * @param message 
     */
    public warn (loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string> {
        let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
        let internalOptions = {
            activeService: "WARN",
            groups: ['ALL', 'WARN']
        };
        return this.internal(opt || {}, internalOptions, message);
    }

    /**
     * console.error aequivalent
     * @param loguptsOptions
     * @param message 
     */
    public error (loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string> {
        let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
        let internalOptions = {
            activeService: "ERROR",
            groups: ['ALL', 'ERROR']
        };
        return this.internal(opt || {}, internalOptions, message);
    }

    /**
     * console.info aequivalent
     * @param loguptsOptions 
     * @param message 
     */
    public info (loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string> {
        let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
        let internalOptions = {
            activeService: "INFO",
            groups: ['ALL', 'INFO']
        };
        return this.internal(opt || {}, internalOptions, message);
    }

    /**
     * create your custom console.log aequivalent
     * @param praefix 
     * @param postfix 
     * @param loguptsOptions 
     * @param message 
     */
    public custom (praefix:string, postfix:string, loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string> {
        let opt: LogUpTsOptions= this.prepareLogUpTsOptions(loguptsOptions, message);
        let internalOptions = {
            activeService: "CUSTOM",
            groups: ['ALL', 'CUSTOM', praefix]
        };
        opt.praefix = praefix;
        opt.postfix = postfix;
        return this.internal(opt || {}, internalOptions, message);
    }
}