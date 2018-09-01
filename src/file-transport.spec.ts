// only for commonjs
import { LogUpTs, LogUpTsOptions } from './logupts';
import { FileTransport, FileInternals } from './file-transport';

if ( typeof module === "object" && typeof module.exports === "object" ) {
    describe( 'LogUpTs File Transport', () => {
        it( 'write to log/test1.log', async () => {

            
            let options: LogUpTsOptions = {
                transports: [ new FileTransport( 'test1.log', '../log', [ 'ALL' ] ) ],
                quiet: true,
            }
            let internals: any & FileInternals = {
            }
            let logger: LogUpTs = new LogUpTs( options, internals );
            logger.log( 'begin file' );
            for ( let i = 0; i < 100; i++ ) {
                logger.log( i+2 + 'Zeile' );
            }
            logger.log( 'end file' );
        } )
        it( 'write to log/test1.log', async () => {

            
            let options: LogUpTsOptions = {
                transports: [ new FileTransport( 'test2.log', '../log', [ 'ERROR' ] ) ],
                quiet: true
            }
            let internals: any & FileInternals = {
            }
            let logger: LogUpTs = new LogUpTs( options, internals );
            logger.log( 'begin file' );
            for ( let i = 0; i < 100; i++ ) {
                logger.log( i+2 + 'Zeile' );
            }
            logger.error( 'end file' );
        } )
    } )
}