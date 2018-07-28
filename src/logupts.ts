import { Placeholder, DefaultPlaceholders } from './placeholder';
import { replaceComplex } from './strplace';

export { Placeholder, DefaultPlaceholders } from './placeholder';

export interface Transport {
    exec: ( transportOptions: any, str: string ) => Promise<void>;
}
export interface LogUpTsOptions {
    /** set the prefix */
    prefix?: string;
    /** postfix */
    postfix?: string;
    /** all Placeholders */
    placeholders?: Placeholder[];
    /** supress console output */
    quiet?: boolean;
    /** write to File or other destinations */
    transports?: Transport[];
    /** execute custom functions when calling the function */
    customFunctions?: (( param: string, internals: any, options: LogUpTsOptions ) => Promise<void>)[];
    /** log, warn, error */
    logType?: string;
    /** log error.stack to console */
    logStack?: boolean;
}

let defaultOptions: LogUpTsOptions = {
    prefix: '{{service}} ',
    postfix: '',
    placeholders: DefaultPlaceholders,
    quiet: false,
    transports: [],
    customFunctions: [],
    logType: 'log',
    logStack: true,
};

export class LogUpTs {
    public internals: object;
    public options: LogUpTsOptions;

    constructor( customOptions?: LogUpTsOptions ) {
        customOptions = customOptions || {};
        // set loguptsoptions
        this.options = {
            prefix: customOptions.prefix !== undefined ? customOptions.prefix : defaultOptions.prefix,
            postfix: customOptions.postfix !== undefined ? customOptions.postfix : defaultOptions.postfix,
            placeholders: customOptions.placeholders !== undefined ? customOptions.placeholders : defaultOptions.placeholders,
            quiet:  customOptions.quiet !== undefined ? customOptions.quiet : defaultOptions.quiet,
            transports:  customOptions.transports !== undefined ? customOptions.transports : defaultOptions.transports,
            customFunctions:  customOptions.customFunctions !== undefined ? customOptions.customFunctions : defaultOptions.customFunctions,
            logType:   customOptions.logType !== undefined ? customOptions.logType : defaultOptions.logType,
            logStack:   customOptions.logStack !== undefined ? customOptions.logStack : defaultOptions.logStack,
        };
        // set defaultinternals
        this.internals = {
            service: 'LOG'
        }
    }
    
    public mergeOptions( customOptions: LogUpTsOptions ): LogUpTsOptions {
        return {
            prefix: customOptions.prefix !== undefined ? customOptions.prefix : this.options.prefix,
            postfix: customOptions.postfix !== undefined ? customOptions.postfix : this.options.postfix,
            placeholders: customOptions.placeholders !== undefined ? customOptions.placeholders : this.options.placeholders,
            quiet:  customOptions.quiet !== undefined ? customOptions.quiet : this.options.quiet,
            transports:  customOptions.transports !== undefined ? customOptions.transports : this.options.transports,
            customFunctions:  customOptions.customFunctions !== undefined ? customOptions.customFunctions : this.options.customFunctions,
            logType:   customOptions.logType !== undefined ? customOptions.logType : this.options.logType,
            logStack:   customOptions.logStack !== undefined ? customOptions.logStack : this.options.logStack,

        };
    }

    public async custom( customOptions: LogUpTsOptions, setInternals: object, message: string ): Promise<string> {
        // setoptions
        let opt = this.mergeOptions( customOptions );
        // set new Internalvalues
        for ( let key in setInternals ) {
            (<any>this.internals)[key] = (<any>setInternals)[key];
        }
        // generate string
        let str: string = `${opt.prefix}${message}${opt.postfix}`;
        str = replaceComplex( (this.options.placeholders || []), str, this.internals );
        let asyncThings: Promise<any>[] = [];
        // add transports
        for ( let transport of opt.transports || [] ) {
            asyncThings.push( transport.exec( this.internals, str ) );
        }
        for ( let asyncExec of opt.customFunctions || [] ) {
            asyncThings.push( asyncExec( str, this.internals, opt ) );
        }
        await Promise.all( asyncThings );
        // check 
        if ( !opt.quiet && ((<any>console)[ opt.logType || 'log' ] !== undefined) ) {
            (<any>console)[ opt.logType || 'log' ]( str );
        }
        return str;
    };
    public async log( str: string, customOptions?: LogUpTsOptions ): Promise<string> {
        return await this.custom( customOptions || {}, { service: 'LOG' }, str );
    }
    public async error( error: string | Error, customOptions?: LogUpTsOptions): Promise<string> {
        let opt = this.mergeOptions( customOptions || {} );
        // set logtype to error -> console.error(str)
        opt.logType = 'error';
        let str = error instanceof Error ? `${error.message}${ (opt.logStack && error.stack !== undefined) ? '\n' + error.stack : ''}` : error;
        return  await this.custom( opt, { service: 'ERROR' }, str );
    }
}