import { InternalLogUpTsOptions, Transport, LogUpTs } from './logupts';
export declare class LogUpTsTransportFile implements Transport {
    private _key;
    path: string;
    fileName: string;
    toPrint: Array<string>;
    loguptsObject: LogUpTs;
    constructor(path: string, fileName: string, loguptsObject: LogUpTs, toPrint: Array<string>);
    readonly key: string;
    exec(internal: InternalLogUpTsOptions, str: string): Promise<void>;
    writeToFs(absolutePath: string, fileName: string, message: string): Promise<void>;
    generateDir(toGenPath: string): void;
}
export declare namespace LTFQ {
    function add(key: string, fnType: () => Promise<void>): void;
    function run(key: string): Promise<any>;
    let ques: Map<string, Array<(() => Promise<any>)>>;
    let queFlags: Map<string, boolean>;
}
