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
}
export declare type text = Array<string> | string;
export interface InternalLogUpTsOptions {
    activeService?: string;
}
export interface Transport {
}
export declare class LogUpTs {
    loguptsOptions: LogUpTsOptions;
    placeholderVars: any;
    constructor();
    generateString(string: string): string;
    private mergeStringArray(textArr);
    private prepareLogUpTsOptions(logUpTsOptions, messageArr?);
    execInternalOptions(internalOptions: InternalLogUpTsOptions): void;
    internal(loguptsOptions: LogUpTsOptions, internalOptions: InternalLogUpTsOptions, ...messages: text[]): string;
    log(loguptsOptions?: LogUpTsOptions | string, ...message: string[]): string;
}
