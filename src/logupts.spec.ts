import { LogUpTs, LogUpTsOptions } from './logupts';
describe( 'test', () => {
    it( 'log to console without Transport and customFunctions', async () => {
        let logger: LogUpTs = new LogUpTs( <LogUpTsOptions>{ quiet: true } );
        let l: string = await logger.log( 'hello' );
        expect( l ).toEqual( '[LOG] hello' );
        // change prefix to a timestamp
        logger.options.prefix  = '{{year}} ';
        l = await logger.log( 'hello' );
        expect( l ).toEqual( '2018 hello' );
    } );

    it( 'log error to console without Transport and customFunctions', async () => {
        let logger: LogUpTs = new LogUpTs( <LogUpTsOptions>{ quiet: true, logStack: false } );
        let l: string = await logger.error( new Error( 'a Error happend') );
        expect( l ).toEqual( '[ERROR] a Error happend' );
    } );
});