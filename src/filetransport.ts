import { ITransport, ITransportArgs } from './transport';
import *  as fs from 'fs';
import { LOGLEVEL } from './loglevel';

export class FileTransport implements ITransport {

    constructor(public fileName: fs.PathLike, public logLevel?: LOGLEVEL) {

    }
    async transport({ formattedMessage, usedLogLevel, instanceLogLevel }: ITransportArgs) {
        return new Promise<void>((resolve, reject) => {
            if (usedLogLevel >= (this.logLevel || instanceLogLevel)) {
                fs.appendFile(this.fileName, formattedMessage, (err) => {
                    if (err) {
                        reject(err)
                        return;
                    }
                    resolve();
                })
            }
        });
    }

}

export class FileTransportSync implements ITransport {

    constructor(public fileName: fs.PathLike, public logLevel?: LOGLEVEL) {

    }
    async transportSync({ formattedMessage, usedLogLevel, instanceLogLevel }: ITransportArgs) {
        if (usedLogLevel >= (this.logLevel || instanceLogLevel)) {
            fs.appendFileSync(this.fileName, formattedMessage)
        }
    };
}
