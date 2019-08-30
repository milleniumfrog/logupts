import { ITransport, ITransportArgs } from './transport';
import { LOGLEVEL } from './loglevel';
import { logLevelMapper } from './utilities';

export class ConsoleTransport implements ITransport {

    constructor(public logLevel?: LOGLEVEL, public stack: boolean = false) {}

    transportSync({ usedLogLevel, instanceLogLevel, formattedMessage, error }: ITransportArgs) {
        if(usedLogLevel >= (this.logLevel || instanceLogLevel) &&  usedLogLevel !== LOGLEVEL.OFF) {
            if (error)
                console[logLevelMapper(usedLogLevel)](`${error.message}${this.stack ? `\n ${error.stack}` : ''}`);
            else
                console[logLevelMapper(usedLogLevel)](formattedMessage);
        }
    }

}