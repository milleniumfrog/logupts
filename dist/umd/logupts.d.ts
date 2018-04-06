import { Placeholder } from './placeholders';
export { Placeholders, Placeholder } from './placeholders';
export declare enum Runtime {
    commonjs = 0,
    amd = 1,
    default = 2,
}
export interface ILogUpTs {
    [prop: string]: any;
    log: (msg: string, options?: ILogUpTsOptions) => string | Promise<string> | void;
    error: (msg: string, options?: ILogUpTsOptions) => string | Promise<string>;
    info: (msg: string, options?: ILogUpTsOptions) => string | Promise<string>;
    custom: (praefix: string, postfix: string, message: string, options?: ILogUpTsOptions, serviceName?: string) => string | Promise<string>;
}
export interface IPaths {
    identifier: string;
    path: string;
    fileName: string;
    serviceToLog: Array<string>;
}
export interface ILogUpTsOptions {
    [index: string]: any;
    praefix?: string;
    postfix?: string;
    placeholders?: {
        [str: string]: Placeholder;
    };
    quiet?: boolean;
    logFiles?: Array<IPaths>;
    writeToFile?: boolean;
    writeToFileSystem?: boolean;
}
export declare class LogUpTs implements ILogUpTs {
    logOptions: ILogUpTsOptions;
    placeholderVars: any;
    private this;
    genDirs: any;
    constructor(logOptions?: ILogUpTsOptions);
    _generateStringOutOfPlaceholderString(str: string | undefined): string;
    _mergeOptions(newOptions: ILogUpTsOptions): void;
    _mergeObjects(currentObj: any, toAddObj: any): any;
    log(message: string, options?: ILogUpTsOptions): string | Promise<string> | void;
    error(message: string | Error, options?: ILogUpTsOptions): string | Promise<string>;
    warn(message: string | Error, options?: ILogUpTsOptions): string | Promise<string>;
    info(message: string, options?: ILogUpTsOptions): string | Promise<string>;
    custom(praefix: string, postfix: string, message: string, options?: ILogUpTsOptions, activeService?: string): string | Promise<string>;
    internal(praefix: string, postfix: string, activeService: string, toPrint: Array<string>, message: string, options?: ILogUpTsOptions, consoleFunc?: string): string | Promise<string>;
    node_allFiles(servicesToLog: Array<string>, message: string, depth?: number): Promise<string>;
    node_writeToFS(absolutePath: string, fileName: string, message: string): Promise<void>;
    node_generateLogDir(toGenPaths: Array<string>): Promise<void>;
}
