import { Placeholder, defaultPlaceholders } from './placeholders';
export { Placeholder, defaultPlaceholders };
export interface LogUpTsOptions {
    [index: string]: any;
    prefix?: string;
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
    [index: string]: any;
    activeService?: string;
    groups?: Array<string>;
    transport?: any;
}
export interface Transport {
    [index: string]: any;
    exec: (transportOptions: InternalLogUpTsOptions, str: string) => Promise<any>;
    key: string;
}
export declare class LogUpTs {
    private debug;
    loguptsOptions: LogUpTsOptions;
    placeholderVars: any;
    constructor(newLogUpTsOptions?: LogUpTsOptions, debug?: boolean);
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
    custom(prefix: string, postfix: string, loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string>;
}
