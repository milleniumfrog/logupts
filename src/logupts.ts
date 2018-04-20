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

export interface Transport {

}

export class LogUpTs {
    public loguptsOptions: LogUpTsOptions;
    constructor() {
        this.loguptsOptions = {
            praefix: '{{service}}',
            postfix: '',
            placeholders: defaultPlaceholders,
            quiet: false,
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

        }

        return string;
    }

    public internal(loguptsOptions: LogUpTsOptions, ...messages: string[]): string {
        return messages[0];
    }
}