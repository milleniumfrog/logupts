import { Placeholder } from './placeholder';
export { Placeholder, DefaultPlaceholders, replacePlaceholder } from './placeholder';
export interface Transport<T = LogUpTsTemplateTypeInterface> {
    exec: (transportOptions: T, str: string) => Promise<void>;
}
export interface LogUpTsTemplateTypeInterface {
    [index: string]: any;
    service: string;
}
export interface LogUpTsOptions<T = LogUpTsTemplateTypeInterface> {
    prefix?: string;
    postfix?: string;
    placeholders?: Placeholder[];
    quiet?: boolean;
    transports?: Transport[];
    customFunctions?: ((param: string, internals: T, options: LogUpTsOptions<T>) => Promise<void>)[];
    logType?: "log" | "warn" | "error" | "trace" | "debug";
    logStack?: boolean;
}
export declare const defaultOptions: LogUpTsOptions<any>;
export declare class LogUpTs<T extends LogUpTsTemplateTypeInterface = {
    service: string;
}> {
    internals: T;
    options: LogUpTsOptions<T>;
    constructor(customOptions?: LogUpTsOptions<T>, setInternals?: T);
    mergeOptions(customOptions: LogUpTsOptions<T>, fillOptions?: LogUpTsOptions<T>): LogUpTsOptions<T>;
    custom(customOptions: LogUpTsOptions<T>, setInternals: any, message: string): Promise<string>;
    log(str: string, customOptions?: LogUpTsOptions<T>): Promise<string>;
    error(error: string | Error, customOptions?: LogUpTsOptions<T>): Promise<string>;
    warn(message: string, customOptions?: LogUpTsOptions<T>): Promise<string>;
    trace(message: string, customOptions?: LogUpTsOptions<T>): Promise<string>;
    debug(message: string, customOptions?: LogUpTsOptions<T>): Promise<string>;
}
export default LogUpTs;
