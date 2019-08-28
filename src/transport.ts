import { LOGLEVEL } from './loglevel';
import { ILogUpTsConfig } from './loguptsconfig';

export interface ITransport {
    transportSync?: (args: ITransportArgs) => void;
    transport?: (args: ITransportArgs) => Promise<void>;
}


export interface ITransportArgs {
    message: string;
    formattedMessage: string;
    instanceLogLevel: LOGLEVEL;
    usedLogLevel: LOGLEVEL;
    parentFunctionName: string;
    loguptsConfig: ILogUpTsConfig;
    error?: Error;
    customArgs: unknown;
}