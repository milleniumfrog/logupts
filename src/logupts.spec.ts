import { LogUpTs, LogUpTsOptions, Placeholder } from './logupts';
describe( 'LogUpTs', () => {
    it( 'log to console without Transport and customFunctions', async () => {
        let logger: LogUpTs = new LogUpTs( <LogUpTsOptions>{ quiet: true } );
        let l: string = await logger.log( 'hello' );
        expect( l ).toEqual( '[LOG] hello' );
        // change prefix to a timestamp
        logger.options.prefix  = '{{year}} ';
        l = await logger.log( 'hello' );
        expect( l ).toEqual( '2018 hello' );
    } );

    it( 'log error to console without Transport and customFunctions, without Stack', async () => {
        let logger: LogUpTs = new LogUpTs( <LogUpTsOptions>{ quiet: true, logStack: false } );
        let l: string = await logger.error( new Error( 'a Error happend') );
        expect( l ).toEqual( '[ERROR] a Error happend' );
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
                        return abs || '';
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
        expect( str ).toEqual( 'hello milleniumfrog' );
    })
});