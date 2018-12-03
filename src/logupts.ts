import { Placeholder, DefaultPlaceholders, replacePlaceholder } from './placeholder';

export { Placeholder, DefaultPlaceholders, replacePlaceholder } from './placeholder';

/**
 * Transport Logmessage to any destination (for example files)
 */
export interface Transport< T = LogUpTsTemplateTypeInterface > {
    exec: ( transportOptions: T, str: string ) => Promise<void>;
}

export interface LogUpTsTemplateTypeInterface {
	[ index: string ]: any,
	service: string;
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
export interface LogUpTsOptions<T = LogUpTsTemplateTypeInterface> {
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
    customFunctions?: (( param: string, internals: T, options: LogUpTsOptions<T> ) => Promise<void>)[];
    /** log, warn, error, trace */
    logType?: "log"|"warn"|"error"|"trace"|"debug";
    /** log error.stack to console */
    logStack?: boolean;
}

/**
 * default LogUpTsoptions
 */
export const defaultOptions: LogUpTsOptions<any> = {
    prefix: '{{service}} ',
    postfix: '',
    placeholders: DefaultPlaceholders,
    quiet: false,
    transports: [],
    customFunctions: [],
    logType: 'log',
	logStack: true,
};

export class LogUpTs<T extends LogUpTsTemplateTypeInterface = { service: string } > {
    public internals: T;
    public options: LogUpTsOptions<T>;

    constructor( customOptions?: LogUpTsOptions<T>, setInternals?: T ) {
        setInternals = setInternals || <T>{};
        customOptions = customOptions || {};
        // set loguptsoptions
        this.options =  this.mergeOptions( customOptions, defaultOptions );
        // set defaultinternals
        this.internals = <T>{
			service: 'log',
		}
		// merge setinternals with this.interals
		Object.assign( this.internals, setInternals );
    }
    
    /**
     * merge LogUpTs options to one option object
     * @param customOptions 
     * @param fillOptions 
     */
    public mergeOptions( customOptions: LogUpTsOptions<T>, fillOptions?: LogUpTsOptions<T> ): LogUpTsOptions<T> {
        fillOptions = fillOptions || this.options;
        return Object.assign( {}, fillOptions, customOptions );
    }

    public async custom( customOptions: LogUpTsOptions<T>, setInternals: any, message: string ): Promise<string> {
        // setoptions
        let opt = this.mergeOptions( customOptions );
        // set new Internalvalues
        for ( let key in setInternals ) {
            this.internals[key] = setInternals[key];
        }
        // generate string
        let str: string = `${opt.prefix}${message}${opt.postfix}`;
        str = replacePlaceholder( (this.options.placeholders || []), str, this.internals );
        // check if quiet or logtype exists
        if ( !opt.quiet && ((<any>console)[ opt.logType || 'log' ] !== undefined) ) {
            (<any>console)[ opt.logType || 'log' ]( str );
        }
		let asyncThings: Promise<any>[] = [];
        // add transports
        for ( let transport of opt.transports || [] ) {
            asyncThings.push( transport.exec( this.internals, str ) );
        }
        for ( let asyncExec of opt.customFunctions || [] ) {
            asyncThings.push( asyncExec( str, this.internals, opt ) );
        }
        await Promise.all( asyncThings );
        return str;
    };

    /**
     * a default log
     * @param str 
     * @param customOptions 
     */
    public async log( str: string, customOptions?: LogUpTsOptions<T> ): Promise<string> {
        return this.custom( customOptions || {}, { service: 'LOG' }, str );
    }

    /**
     * log errors
     * @param error 
     * @param customOptions 
     */
    public async error( error: string | Error, customOptions?: LogUpTsOptions<T> ): Promise<string> {
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
    public async warn( message: string, customOptions?: LogUpTsOptions<T> ): Promise<string> {
        let opt = this.mergeOptions( customOptions || {} );
        // set logtype to warn -> console.warn(str)
        opt.logType = 'warn';
        return this.custom( opt, { service: 'WARN' }, message );
	}
	
	public async trace( message: string, customOptions?: LogUpTsOptions<T> ): Promise<string> {
        let opt = this.mergeOptions( customOptions || {} );
        // set logtype to warn -> console.trace(str)
        opt.logType = 'trace';
        return this.custom( opt, { service: 'TRACE' }, message );
	}

	public async debug( message: string, customOptions?: LogUpTsOptions<T> ): Promise<string> {
        let opt = this.mergeOptions( customOptions || {} );
        // set logtype to warn -> console.debug(str)
        opt.logType = 'debug';
        return this.custom( opt, { service: 'DEBUG' }, message );
	}

}

export default LogUpTs;