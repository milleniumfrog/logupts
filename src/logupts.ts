import { Placeholder, DefaultPlaceholders, replacePlaceholder } from './placeholder';

export { Placeholder, DefaultPlaceholders, replacePlaceholder } from './placeholder';

/**
 * Transport Logmessage
 */
export interface Transport {
    exec: ( transportOptions: any, str: string ) => Promise<void>;
}

/**
 * configure LogUpTs
 * configure
 * - prefix
 * - postfix
 * - placeholders
 * - quiet (log it to console)
 * - transports
 * - customfunction (run functions when log gets executed)
 * - logtype (log/info/error)
 * - logstack
 */
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

/**
 * default LogUpTsoptions
 */
export const defaultOptions: LogUpTsOptions = {
    prefix: '{{service}} ',
    postfix: '',
    placeholders: DefaultPlaceholders,
    quiet: false,
    transports: [],
    customFunctions: [],
    logType: 'log',
    logStack: true,
};

export class LogUpTs<T = {}> {
    public internals: any;
    public options: LogUpTsOptions;

    constructor( customOptions?: LogUpTsOptions, setInternals?: any ) {
        setInternals = setInternals || {};
        customOptions = customOptions || {};
        // set loguptsoptions
        this.options =  this.mergeOptions( customOptions, defaultOptions );
        // set defaultinternals
        this.internals = {
            service: 'LOG'
        }
        for ( let key in setInternals ) {
            this.internals[key] = setInternals[key];
        }
    }
    
    /**
     * merge LogUpTs options to one option object
     * @param customOptions 
     * @param fillOptions 
     */
    public mergeOptions( customOptions: LogUpTsOptions, fillOptions?: LogUpTsOptions ): LogUpTsOptions {
        fillOptions = fillOptions || this.options;
        return {
            prefix: customOptions.prefix !== undefined ? customOptions.prefix : fillOptions.prefix,
            postfix: customOptions.postfix !== undefined ? customOptions.postfix : fillOptions.postfix,
            placeholders: customOptions.placeholders !== undefined ? customOptions.placeholders : fillOptions.placeholders,
            quiet:  customOptions.quiet !== undefined ? customOptions.quiet : fillOptions.quiet,
            transports:  customOptions.transports !== undefined ? customOptions.transports : fillOptions.transports,
            customFunctions:  customOptions.customFunctions !== undefined ? customOptions.customFunctions : fillOptions.customFunctions,
            logType:   customOptions.logType !== undefined ? customOptions.logType : fillOptions.logType,
            logStack:   customOptions.logStack !== undefined ? customOptions.logStack : fillOptions.logStack,

        };
    }

    public async custom( customOptions: LogUpTsOptions, setInternals: any, message: string ): Promise<string> {
        // setoptions
        let opt = this.mergeOptions( customOptions );
        // set new Internalvalues
        for ( let key in setInternals ) {
            this.internals[key] = setInternals[key];
        }
        // generate string
        let str: string = `${opt.prefix}${message}${opt.postfix}`;
        str = replacePlaceholder( (this.options.placeholders || []), str, this.internals );
        let asyncThings: Promise<any>[] = [];
        // add transports
        for ( let transport of opt.transports || [] ) {
            asyncThings.push( transport.exec( this.internals, str ) );
        }
        for ( let asyncExec of opt.customFunctions || [] ) {
            asyncThings.push( asyncExec( str, this.internals, opt ) );
        }
        await Promise.all( asyncThings );
        // check if quiet or logtype exists
        if ( !opt.quiet && ((<any>console)[ opt.logType || 'log' ] !== undefined) ) {
            (<any>console)[ opt.logType || 'log' ]( str );
        }
        return str;
    };

    /**
     * a default log
     * @param str 
     * @param customOptions 
     */
    public async log( str: string, customOptions?: LogUpTsOptions ): Promise<string> {
        return this.custom( customOptions || {}, { service: 'LOG' }, str );
    }

    /**
     * log errors
     * @param error 
     * @param customOptions 
     */
    public async error( error: string | Error, customOptions?: LogUpTsOptions): Promise<string> {
        let opt = this.mergeOptions( customOptions || {} );
        // set logtype to error -> console.error(str)
        opt.logType = 'error';
        let str = error instanceof Error ? `${error.message}${ (opt.logStack && error.stack !== undefined) ? '\n' + error.stack : ''}` : error;
        return  this.custom( opt, { service: 'ERROR' }, str );
    }

    /**
     * warn
     * @param message 
     * @param customOptions 
     */
    public async warn( message: string, customOptions?: LogUpTsOptions ): Promise<string> {
        let opt = this.mergeOptions( customOptions || {} );
        // set logtype to warn -> console.warn(str)
        opt.logType = 'warn';
        return this.custom( opt, { service: 'WARN' }, message );
    }

}

export default LogUpTs;