import { LOGLEVEL } from './loglevel';

import { ITransport } from './transport';

import { ConsoleTransport } from './consoletransport';
import { IFormatter } from './formatter';

export interface ILogUpTsConfig {
    logLevel: LOGLEVEL;
    prefix: string;
    postfix: string;
    transports: ITransport[];
    formatter: IFormatter
}

export const defaultConfig: ILogUpTsConfig = {
    logLevel: LOGLEVEL.WARN,
    prefix: '{{loglevel}}',
    postfix: '',
    transports: [new ConsoleTransport()],
    formatter: { format: value => value.message || (value.error || {message: ''}).message }
};