// only for commonjs
import { LogUpTs, LogUpTsOptions } from './logupts';
import { FileTransport, FileInternals } from './file-transport';
import fs from 'fs';
import path from 'path';

if ( typeof module === "object" && typeof module.exports === "object" ) {
    describe( 'LogUpTs File Transport', () => {
        it( 'write to log/test1.log', async () => {

            
            let options: LogUpTsOptions = {
                transports: [ new FileTransport( 'test1.log', '../log', [ 'ALL' ] ) ]
            }
            let internals: any & FileInternals = {
                file: {
                    toPrint: [ 'ALL' ]
                }
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
                transports: [ new FileTransport( 'test1.log', '../log', [ 'ALL' ] ) ]
            }
            let internals: any & FileInternals = {
                file: {
                    toPrint: [ 'ERROR' ]
                }
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