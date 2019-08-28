import { CustomArgs } from './logupts';
import { LOGLEVEL } from './loglevel';
import { ILogUpTsConfig, defaultConfig } from './loguptsconfig';
import { ITransportArgs } from './transport';
import { IFormatter } from './formatter';

export { LOGLEVEL } from './loglevel';
export { ITransportArgs, ITransport } from './transport';
export { IFormatter, IFormatArgs } from './formatter';
export { ILogUpTsConfig, defaultConfig } from './loguptsconfig';

export class LogUpTsSync {

    static defaultConfig: ILogUpTsConfig

    public config: ILogUpTsConfig;
    _ques: {
        sync: { transportSync(args: ITransportArgs): void }[];
        async: { transport(args: ITransportArgs): Promise<void>; }[];
    }

    constructor(
        config?: Partial<ILogUpTsConfig>
    ) {
        this.config = Object.assign({}, defaultConfig, config);
        this._ques = {
            sync: [],
            async: [],
        }
        for (const transport of this.config.transports) {
            if (transport.transportSync)
                this._ques.sync.push(transport as { transportSync(args: ITransportArgs): void })
            if (transport.transport)
                this._ques.async.push(transport as { transport(args: ITransportArgs): Promise<void>; })

        }
    }
    customSync(
        {
            message = '',
            customArgs,
            logLevel = LOGLEVEL.INFO,
            customConfig = {},
            customFormatter = this.config.formatter,
            error,
            parentFunctionName = 'log'
        }: CustomArgs = {}
    ): ITransportArgs {
        const str = customFormatter.format({
            message: message,
            error,
            prefix: customConfig.prefix || this.config.prefix,
            postfix: customConfig.postfix || this.config.postfix,
            logLevel,
            parentFunctionName,
            customArgs,
        });
        const transportArgs: ITransportArgs = {
            message,
            formattedMessage: str,
            instanceLogLevel: this.config.logLevel,
            usedLogLevel: logLevel || this.config.logLevel,
            loguptsConfig: Object.assign({}, this.config, customConfig),
            customArgs,
            error,
            parentFunctionName,
        }
        for (const transport of this._ques.sync)
            transport.transportSync(transportArgs);
        return transportArgs;
    }
    _logServiceSync(logServiceArgs: {parentFunctionName: string, logLevel: LOGLEVEL},
        custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string,  
        ...messages: string[]): string 
    {
        if (typeof custom === 'string') 
            messages.unshift(custom);
        return this.customSync({
            message: messages.join(' '),
            parentFunctionName: logServiceArgs.parentFunctionName,
            logLevel: logServiceArgs.logLevel,
            customArgs: typeof custom !== 'string' ? custom.args : undefined,
            customConfig: typeof custom !== 'string' ? custom.config : undefined,
            error:  typeof custom !== 'string' ? custom.error : undefined,
            customFormatter: typeof custom !== 'string' ? custom.formatter : undefined,
        }).formattedMessage;
    };

    log(...messages: string[]): string;
    log( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string, ...messages: string[]): string {
        return this._logServiceSync({
            logLevel: LOGLEVEL.INFO,
            parentFunctionName: 'log',
        }, custom, ...messages);
    }

    info(...messages: string[]): string;
    info( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string, ...messages: string[]): string {
        return this._logServiceSync({
            logLevel: LOGLEVEL.INFO,
            parentFunctionName: 'log',
        }, custom, ...messages);
    }

    debug(...messages: string[]): string;
    debug( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string, ...messages: string[]): string {
        return this._logServiceSync({
            logLevel: LOGLEVEL.DEBUG,
            parentFunctionName: 'debug',
        }, custom, ...messages);
    }

    trace(...messages: string[]): string;
    trace( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string, ...messages: string[]): string {
        return this._logServiceSync({
            logLevel: LOGLEVEL.TRACE,
            parentFunctionName: 'trace',
        }, custom, ...messages);
    }

    warn(...messages: string[]): string;
    warn( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string, ...messages: string[]): string {
        return this._logServiceSync({
            logLevel: LOGLEVEL.WARN,
            parentFunctionName: 'warn',
        }, custom, ...messages);
    }

    error(error: Error | string, ...messages: string[]): string;
    error( custom: {args?: unknown, config?: ILogUpTsConfig, formatter?: IFormatter, error?: Error} | string | Error,...messages: string[]): string {
        return this._logServiceSync({
            logLevel: LOGLEVEL.ERROR,
            parentFunctionName: 'error',
        }, custom instanceof Error ? {error:custom} : custom , ...messages);
    }


}