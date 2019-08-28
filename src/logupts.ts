import { LOGLEVEL } from './loglevel';
import { ConsoleTransport } from './consoletransport';
import { LogUpTsSync } from './loguptssync';


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
    formatter: { format: value => value.message }
};

export type CustomArgs = {

    message?: string;
    customArgs?: unknown;
    logLevel?: LOGLEVEL;
    customConfig?: Partial<ILogUpTsConfig>;
    customFormatter?: IFormatter;
    error?: Error,
    parentFunctionName?: string
};

export class LogUpTs {

    public syncInstance: LogUpTsSync
    constructor(
        config?: Partial<ILogUpTsConfig>
    ) {
        this.syncInstance = new LogUpTsSync(config);
    }
    async custom( 
        {
            message = '',
            customArgs,
            logLevel = LOGLEVEL.INFO,
            customConfig = {},
            customFormatter = this.syncInstance.config.formatter,
            error,
            parentFunctionName = 'log'
        }: CustomArgs = {}
    ): Promise<ITransportArgs> {
        const transportArgs = this.syncInstance.customSync({message, customArgs, logLevel, customConfig, customFormatter, error, parentFunctionName});
        const promiseArr: Promise<unknown>[] = [];
        for (const transport of this.syncInstance._ques.async) {
            promiseArr.push(transport.transport(transportArgs))
        }
        await Promise.all(promiseArr);
        return transportArgs;
    }

    async _logService(logServiceArgs: {parentFunctionName: string, logLevel: LOGLEVEL},
        custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string,  
        ...messages: string[]): Promise<string> 
    {
        if (typeof custom === 'string') 
            messages.unshift(custom);
        return (await this.custom({
            message: messages.join(' '),
            parentFunctionName: logServiceArgs.parentFunctionName,
            logLevel: logServiceArgs.logLevel,
            customArgs: typeof custom !== 'string' ? custom.args : undefined,
            customConfig: typeof custom !== 'string' ? custom.config : undefined,
            error:  typeof custom !== 'string' ? custom.error : undefined,
            customFormatter: typeof custom !== 'string' ? custom.formatter : undefined,
        })).formattedMessage;
    };

    async log(...messages: string[]): Promise<string>;
    async log( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string, ...messages: string[]): Promise<string> {
        return this._logService({
            logLevel: LOGLEVEL.INFO,
            parentFunctionName: 'log',
        }, custom, ...messages);
    }

    async info(...messages: string[]): Promise<string>;
    async info( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string, ...messages: string[]): Promise<string> {
        return this._logService({
            logLevel: LOGLEVEL.INFO,
            parentFunctionName: 'log',
        }, custom, ...messages);
    }

    async debug(...messages: string[]): Promise<string>;
    async debug( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string, ...messages: string[]): Promise<string> {
        return this._logService({
            logLevel: LOGLEVEL.DEBUG,
            parentFunctionName: 'debug',
        }, custom, ...messages);
    }

    async trace(...messages: string[]): Promise<string>;
    async trace( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string, ...messages: string[]): Promise<string> {
        return this._logService({
            logLevel: LOGLEVEL.TRACE,
            parentFunctionName: 'trace',
        }, custom, ...messages);
    }

    async warn(...messages: string[]): Promise<string>;
    async warn( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string, ...messages: string[]): Promise<string> {
        return this._logService({
            logLevel: LOGLEVEL.WARN,
            parentFunctionName: 'warn',
        }, custom, ...messages);
    }

    async error(error: Error | string, ...messages: string[]): Promise<string>;
    async error( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string | Error,...messages: string[]): Promise<string> {
        return this._logService({
            logLevel: LOGLEVEL.WARN,
            parentFunctionName: 'warn',
        }, custom instanceof Error ? {error:custom} : custom , ...messages);
    }
}