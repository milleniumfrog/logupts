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
}

export type text = Array<string> | string;

export interface InternalLogUpTsOptions {
    activeService?: string;
}

export interface Transport {

}

export class LogUpTs {
    public loguptsOptions: LogUpTsOptions;
    public placeholderVars: any;
    constructor() {
        this.loguptsOptions = {
            praefix: '{{service}} ',
            postfix: '',
            placeholders: defaultPlaceholders,
            quiet: false,
        }
        this.placeholderVars = {
            activeService: 'LOG'
        }
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
            let opt: LogUpTsOptions = JSON.parse(JSON.stringify(this.loguptsOptions));
            for (let propKey in logUpTsOptions) {
                opt[propKey] = logUpTsOptions[propKey];
            }
            return opt;
        }
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

    public internal(loguptsOptions: LogUpTsOptions, internalOptions :InternalLogUpTsOptions, ...messages:  text[]): string {
        // merge options parameter with internals
        let opt = this.prepareLogUpTsOptions(loguptsOptions, messages);
        this.execInternalOptions(internalOptions);
        let str = opt.praefix + this.mergeStringArray(messages)
            + opt.postfix;
        str = this.generateString(str);
        if ((opt.transports || []).length === 0)
            return str;
    }

    public log (loguptsOptions?: LogUpTsOptions | string, ...message: string[]) {
        let opt = this.prepareLogUpTsOptions(loguptsOptions, message);
        let internalOptions = {
            activeService: "LOG"
        };
        return this.internal(opt || {}, internalOptions, message);
    }
}