import { Placeholder } from './placeholder';
export { Placeholder, DefaultPlaceholders } from './placeholder';
export interface Transport {
    exec: (transportOptions: any, str: string) => Promise<void>;
}
export interface LogUpTsOptions {
    /** set the prefix */
    prefix?: string;
    /** postfix */
    postfix?: string;
    /** all Placeholders */
    placeholders?: Placeholder[];
    /** supress console output */
    quiet?: boolean;
    /** write to File or other destinations */
    transports?: Transport[];
    /** execute custom functions when calling the function */
    customFunctions?: ((param: string, internals: any, options: LogUpTsOptions) => Promise<void>)[];
    /** log, warn, error */
    logType?: string;
    /** log error.stack to console */
    logStack?: boolean;
}
export declare const defaultOptions: LogUpTsOptions;
export declare class LogUpTs {
    internals: any;
    options: LogUpTsOptions;
    constructor(customOptions?: LogUpTsOptions, setInternals?: any);
    mergeOptions(customOptions: LogUpTsOptions): LogUpTsOptions;
    custom(customOptions: LogUpTsOptions, setInternals: any, message: string): Promise<string>;
    /**
     * a default log
     * @param str
     * @param customOptions
     */
    log(str: string, customOptions?: LogUpTsOptions): Promise<string>;
    /**
     * log errors
     * @param error
     * @param customOptions
     */
    error(error: string | Error, customOptions?: LogUpTsOptions): Promise<string>;
    warn(message: string, customOptions?: LogUpTsOptions): Promise<string>;
}
