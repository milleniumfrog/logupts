import fs from 'fs'; 
import path from 'path';
import { Transport } from './logupts';
import { Placeholder, DefaultPlaceholders, replacePlaceholder } from './placeholder';

export interface FileInternals {
    file: {
        toPrint: string[];
    }
}

export class FileTransport implements Transport {
    public filename: string;
    public path: string;
    public toPrint: string[];
    private _que: [any, string][];
    public placeholders: Placeholder[];
    private _running: boolean;

    /**
     * create FileTransport Object and create directory
     * @param filename 
     * @param filepath 
     * @param printGroups 
     * @param placeholders 
     */
    constructor( filename: string, filepath: string, printGroups: string[], placeholders?: Placeholder[] ) {
        this.filename = filename;
        this.path = path.isAbsolute( filepath ) ? filepath : path.resolve( __dirname, filepath );
        this.toPrint = printGroups;
        this.placeholders = placeholders || DefaultPlaceholders;
        this._que = [];
        this._running = false;
        // generate directory for log files
        const pathSegments: string[] = this.path.split( path.sep );
        let pathToCheck: string = '';
        for ( let pathSegment of pathSegments ) {
            // if root dir then continue
            if ( pathSegment === '/' || pathSegment === '' )
                continue;
            pathToCheck += `/${ pathSegment }`;
            // create missing directories
            if ( !fs.existsSync( pathToCheck ) )
                fs.mkdirSync( pathToCheck );
        }
    }

    /**
     * start transport from stdout to file
     * @param internalOptions 
     * @param str 
     */
    public async exec( internalOptions: any, str: string ): Promise<void> {
        if ( internalOptions.service === undefined )
            throw new Error( 'interrnal Options file are not set' )
        if ( this.toPrint.indexOf( 'ALL' ) >= 0 || this.toPrint.indexOf( internalOptions.service ) >= 0 )
            this._que.push( [internalOptions, str] );
    
        if ( !this._running )
            await this._run();
        else
            this._running = true;
    }

    /**
     * work on que
     */
    private async _run() {
        while ( this._que.length > 0 ) {
            const data: [any, string] = this._que.shift() || [ undefined, 'null' ];
            await this._writeToFS( data[0], data[1] );
        }
        this._running = false;
    }

    /**
     * write to file and create if not existing
     * @param internals 
     * @param str 
     */
    private _writeToFS( internals: any, str: string ) {
        return new Promise<void>( ( resolve, reject) => {
            let filename: string = replacePlaceholder( this.placeholders, this.filename, internals );
            let filePath: string = `${this.path}/${filename}`;
            fs.writeFile( filePath, str + '\n', { flag: 'a' }, ( error: NodeJS.ErrnoException ) => {
                if ( error )
                    reject( error );
                resolve();
            } );
        } )
    }
}