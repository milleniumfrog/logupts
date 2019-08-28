import { LogUpTsSync } from './loguptssync';
import { ITransport, ITransportArgs } from './logupts';

describe('class LogUpTsSync', () => {
    it('ques get initialized, correct', () => {
        // create demo transports
        const transport1: ITransport = {
            async transport(args: ITransportArgs) {},
            transportSync(args: ITransportArgs) {}
        };
        const transport2: ITransport = {};
        const transport3: ITransport = {
            transportSync(args: ITransportArgs) {}
        };
        const transport4: ITransport = {
            async transport(args: ITransportArgs) {}
        };
        const transport5: ITransport = {
            async transport(args: ITransportArgs) {},
            transportSync(args: ITransportArgs) {}
        };
    })
})