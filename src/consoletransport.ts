import { ITransport, ITransportArgs } from './transport';
import { LOGLEVEL } from './loglevel';
import { logLevelMapper } from './utilities';

export class ConsoleTransport implements ITransport {

    constructor(public logLevel?: LOGLEVEL) {}

    transportSync(args: ITransportArgs) {
        if(args.usedLogLevel >= (this.logLevel || args.instanceLogLevel) &&  args.usedLogLevel !== LOGLEVEL.OFF) {
            console[logLevelMapper(args.usedLogLevel)](args.formattedMessage);
        }
    }

}