import { Placeholder } from './placeholder';
export { Placeholder, DefaultPlaceholders, replacePlaceholder } from './placeholder';
export interface Transport {
    exec: (transportOptions: any, str: string) => Promise<void>;
}
export interface LogUpTsOptions {
    prefix?: string;
    postfix?: string;
    placeholders?: Placeholder[];
    quiet?: boolean;
    transports?: Transport[];
    customFunctions?: ((param: string, internals: any, options: LogUpTsOptions) => Promise<void>)[];
    logType?: string;
    logStack?: boolean;
}
export declare const defaultOptions: LogUpTsOptions;
export declare class LogUpTs<T = {}> {
    internals: any;
    options: LogUpTsOptions;
    constructor(customOptions?: LogUpTsOptions, setInternals?: any);
    mergeOptions(customOptions: LogUpTsOptions, fillOptions?: LogUpTsOptions): LogUpTsOptions;
    custom(customOptions: LogUpTsOptions, setInternals: any, message: string): Promise<string>;
    log(str: string, customOptions?: LogUpTsOptions): Promise<string>;
    error(error: string | Error, customOptions?: LogUpTsOptions): Promise<string>;
    warn(message: string, customOptions?: LogUpTsOptions): Promise<string>;
}
