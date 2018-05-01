import { Placeholder, defaultPlaceholders } from './placeholders';
export { Placeholder, defaultPlaceholders };
export declare const DEBUG: boolean;
export interface LogUpTsOptions {
    [index: string]: any;
    praefix?: string;
    postfix?: string;
    placeholders?: {
        [str: string]: Placeholder;
    };
    quiet?: boolean;
    transports?: Transport[];
    customExecutions?: ((...params: any[]) => any)[];
    customAsyncExecutions?: ((...params: any[]) => Promise<any>)[];
}
export declare type text = Array<string> | string;
export interface InternalLogUpTsOptions {
    activeService?: string;
    groups?: Array<string>;
}
export interface Transport {
    exec: (transportOptions: InternalLogUpTsOptions, str: string) => Promise<any>;
    key: string;
}
export declare class LogUpTs {
    loguptsOptions: LogUpTsOptions;
    placeholderVars: any;
    constructor(newLogUpTsOptions?: LogUpTsOptions);
    generateString(string: string): string;
    static generateString(logupts: LogUpTs, string: string): string;
    defaultLogUpTsOptions(): LogUpTsOptions;
    mergeStringArray(textArr: text[]): string;
    prepareLogUpTsOptions(logUpTsOptions: LogUpTsOptions | string | undefined, messageArr?: text[]): LogUpTsOptions;
    mergeLogUpTsOptions(a: LogUpTsOptions, b: LogUpTsOptions): LogUpTsOptions;
    copyLotUpTsOptions(logUpTsOptions: LogUpTsOptions): LogUpTsOptions;
    execInternalOptions(internalOptions: InternalLogUpTsOptions): void;
    internal(loguptsOptions: LogUpTsOptions, internalOptions: InternalLogUpTsOptions, ...messages: text[]): string | Promise<string>;
    log(loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string>;
    warn(loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string>;
    error(loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string>;
    info(loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string>;
    custom(praefix: string, postfix: string, loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string>;
}
