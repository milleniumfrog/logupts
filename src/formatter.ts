import { LOGLEVEL } from './loglevel';

export interface IFormatArgs {
    message: string;
    error?: Error;
    prefix: string;
    postfix: string;
    customArgs: unknown;
    logLevel: LOGLEVEL;
    parentFunctionName: string;
}

export interface IFormatter {
    format(args: IFormatArgs): string;
}