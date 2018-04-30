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
}
export interface Transport {
    exec: (transportOptions: InternalLogUpTsOptions, str: string) => Promise<any>;
    key: string;
}
export declare class LogUpTs {
    protected loguptsOptions: LogUpTsOptions;
    protected placeholderVars: any;
    constructor(newLogUpTsOptions?: LogUpTsOptions);
    generateString(string: string): string;
    protected defaultLogUpTsOptions(): LogUpTsOptions;
    protected mergeStringArray(textArr: text[]): string;
    protected prepareLogUpTsOptions(logUpTsOptions: LogUpTsOptions | string | undefined, messageArr?: text[]): LogUpTsOptions;
    protected mergeLogUpTsOptions(a: LogUpTsOptions, b: LogUpTsOptions): LogUpTsOptions;
    protected copyLotUpTsOptions(logUpTsOptions: LogUpTsOptions): LogUpTsOptions;
    protected execInternalOptions(internalOptions: InternalLogUpTsOptions): void;
    internal(loguptsOptions: LogUpTsOptions, internalOptions: InternalLogUpTsOptions, ...messages: text[]): string | Promise<string>;
    log(loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string>;
    warn(loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string>;
    error(loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string>;
    info(loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string>;
    custom(praefix: string, postfix: string, loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string | Promise<string>;
}
