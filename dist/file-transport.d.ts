import { Transport } from './logupts';
import { Placeholder } from './placeholder';
export interface FileInternals {
    file: {
        toPrint: string[];
    };
}
export declare class FileTransport implements Transport {
    filename: string;
    path: string;
    toPrint: string[];
    private _que;
    placeholders: Placeholder[];
    private _running;
    constructor(filename: string, filepath: string, printGroups: string[], placeholders?: Placeholder[]);
    exec(internalOptions: any, modifiedStr: string, orginalStr: string): Promise<void>;
    private _run;
    private _writeToFS;
}
