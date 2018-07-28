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
export declare class LogUpTs {
    internals: object;
    options: LogUpTsOptions;
    constructor(customOptions?: LogUpTsOptions, setInternals?: object);
    mergeOptions(customOptions: LogUpTsOptions): LogUpTsOptions;
    custom(customOptions: LogUpTsOptions, setInternals: object, message: string): Promise<string>;
    log(str: string, customOptions?: LogUpTsOptions): Promise<string>;
    error(error: string | Error, customOptions?: LogUpTsOptions): Promise<string>;
}
