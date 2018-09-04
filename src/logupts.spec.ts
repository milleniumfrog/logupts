import { expect } from 'chai';
import { LogUpTs, LogUpTsOptions } from './logupts';

describe( 'LogUpTs', () => {
    it( 'log to console without Transport and customFunctions', async () => {
        let logger: LogUpTs = new LogUpTs( <LogUpTsOptions>{ quiet: true } );
        let l: string = await logger.log( 'hello' );
        expect( l ).to.eql( '[LOG] hello' );
        // change prefix to a timestamp
        logger.options.prefix  = '{{year}} ';
        l = await logger.log( 'hello' );
        expect( l ).to.eql( '2018 hello' );
    } );

    it( 'log error to console without Transport and customFunctions, without Stack', async () => {
        let logger: LogUpTs = new LogUpTs( <LogUpTsOptions>{ quiet: true, logStack: false } );
        let l: string = await logger.error( new Error( 'a Error happend') );
        expect( l ).to.eql( '[ERROR] a Error happend' );
    });

    it( 'log error to console without Transport and customFunctions, with Stack', async () => {
        let logger: LogUpTs = new LogUpTs( <LogUpTsOptions>{ quiet: true, logStack: true } );
        let l: string = await logger.error( new Error( 'a Error happend') );
        if ( l.length < 100 ) {
            throw new Error( 'string is a lot to short' );
        }
    });

    it( 'add a new Placeholder and replace the defaultplaceholders', async () => {
        let conf: LogUpTsOptions = {
            quiet: true,
            prefix: '',
            placeholders: [
                {
                    keys: ['<a>', '</a>'],
                    replacer: ( abs?: string, passArg?: any ) => {
                        return '<link>' + abs;
                    },
                    flags: 'g',
                },
                {
                    keys: ['<maintainer />'],
                    flags: 'g',
                    replacer: () => {
                        return 'milleniumfrog';
                    }
                }
            ],
        };
        let logger: LogUpTs = new LogUpTs( conf, {} );
        let str: string = await logger.log( '<a>hello <maintainer /></a>' );
        expect( str ).to.eql( '<link>hello milleniumfrog' );
    })

    it( 'test async functions', async () => {
        let changed: boolean = false;
        let options: LogUpTsOptions = { quiet: true };
        options.customFunctions = [];
        options.customFunctions.push( async ( param: string, internals: any, options: LogUpTsOptions) => {
            changed = true;
        } )
        let logger: LogUpTs = new LogUpTs( options );
        await logger.log( 'hello' );
        expect( changed ).to.eql( true );
    } )

    it( 'create new custom function', async () => {
        let logger: LogUpTs | (LogUpTs & { info: ( str: string ) => Promise<string> })= new LogUpTs(  );
        let info: ( str: string ) => Promise<string> = async ( str: string) => {
            logger.options.logType = "INFO";
            logger.internals.service = "INFO";
            return logger.custom( logger.options, logger.internals, str );
        }
        expect( await info( "hello" ) ).to.eql( "[INFO] hello" );    
    } )

    it( 'inherit class with new function', async () => {
        class eLogUpTs extends LogUpTs {
            constructor() {
                super( {quiet: true} );
            }

            info( msg: string ) {
                this.options.logType = 'LOG';
                this.internals.service = 'INFO'
                return super.custom(this.options, this.internals, "hello");
            }
        }
        let logger= new eLogUpTs();
        expect( await logger.info( "hello" ) ).to.eql( "[INFO] hello" );
    } )
});