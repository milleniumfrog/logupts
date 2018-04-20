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
export interface Transport {
}
export declare class LogUpTs {
    loguptsOptions: LogUpTsOptions;
    constructor();
    generateString(string: string): string;
    internal(loguptsOptions: LogUpTsOptions, ...messages: string[]): string;
}
