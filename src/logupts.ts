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
    transports?: Transport[];
    /** executes in internal function */
    customExecutions?: ((...params: any[]) => any)[];
    /** executes in internal function, => always returns a promise */
    customAsyncExecutions?: ((...params: any[]) => Promise<any>)[]
}

export type text = Array<string> | string;

export interface InternalLogUpTsOptions {
    activeService?: string;
    transportOptions? :TransportOptions;
}

export interface Transport {
    exec: (transportOptions: TransportOptions, str: string) => Promise<any>;
}

export interface TransportOptions {

}

export class LogUpTs {
    public loguptsOptions: LogUpTsOptions;
    public placeholderVars: any;
    constructor(newLogUpTsOptions: LogUpTsOptions = {}) {
        this.loguptsOptions = {
            praefix: '{{service}} ',
            postfix: '',
            placeholders: defaultPlaceholders,
            quiet: false,
        }
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

    /** get a text Array 
     * @param {text[]} textArr 
     * @returns {string}
    */
    private mergeStringArray(textArr: text[]): string {
        let str = '';
        for (let strPart of textArr) {
            if (typeof strPart !== 'string') {
                strPart = this.mergeStringArray(strPart);
            }
            str += strPart;
        }
        return str;
    }

    private prepareLogUpTsOptions(logUpTsOptions: LogUpTsOptions | string | undefined, messageArr?: text[]): LogUpTsOptions {
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
            let opt: LogUpTsOptions = this.deepClone(this.loguptsOptions);
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
    private mergeLogUpTsOptions(a: LogUpTsOptions, b: LogUpTsOptions): LogUpTsOptions {
        let opt: LogUpTsOptions = this.deepClone(a);
        for (let propKey in b) {
            opt[propKey] = b[propKey];
        }
        return opt;
    }

    // TODO replace deepclone with copyconstructor of LogUpTsOptions
    private deepClone(obj: LogUpTsOptions): LogUpTsOptions {
        let clone: LogUpTsOptions = {};
        for(let i in obj) {
            if (typeof(obj[i])=="object" && obj[i] != null) {
                clone[i] = this.deepClone(obj[i]);
            } else {
                clone[i] = obj[i];
            }
        }
        return clone;
    }

    public execInternalOptions(internalOptions: InternalLogUpTsOptions) {
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
        // log to console
        if (!opt.quiet)
            console.log(str);
        if ((opt.transports || []).length === 0 && (opt.customAsyncExecutions || []).length === 0){
            return str;
        }
        else {
            // collect all Promises in one Array
            let promArr: Promise<any>[] = [];
            // add Transport promises
            for(let transport of opt.transports || []) {
                promArr.push(transport.exec(internalOptions || {}, str));
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
            activeService: "INFO",
            groups: ['ALL', 'CUSTOM', praefix]
        };
        opt.praefix = praefix;
        opt.postfix = postfix;
        return this.internal(opt || {}, internalOptions, message);
    }
}