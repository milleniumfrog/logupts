import { LogUpTsSync } from './loguptssync';
import { ITransport, ITransportArgs } from './logupts';
import * as chai from 'chai';
import { LOGLEVEL } from './loglevel';

describe('class LogUpTsSync', () => {
    it('ques get initialized, correctly', () => {
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
        const demo = new LogUpTsSync({
            transports: [transport1, transport2, transport3, transport4, transport5],
        });
        chai.assert(transport1 === demo._ques.sync[0], 'que is not initialized correctly');
        chai.assert(transport1 === demo._ques.async[0], 'que is not initialized correctly');
        chai.assert(demo._ques.sync.indexOf(transport2 as any) < 0, 'que is not initialized correctly');
        chai.assert(demo._ques.async.indexOf(transport2 as any) < 0, 'que is not initialized correctly');
        chai.assert(transport3 === demo._ques.sync[1], 'que is not initialized correctly');
        chai.assert(transport3 !== demo._ques.async[1], 'que is not initialized correctly');
        chai.assert(transport4 !== demo._ques.sync[2], 'que is not initialized correctly');
        chai.assert(transport4 === demo._ques.async[1], 'que is not initialized correctly');
        chai.assert(transport5 === demo._ques.sync[2], 'que is not initialized correctly');
        chai.assert(transport5 === demo._ques.async[2], 'que is not initialized correctly');
    });
    
    it('TODO config is initialized correctly', () => {})

    it('default custom returns correct transportdata', () => {
        const demo = new LogUpTsSync();
        const {
            customArgs,
            error,
            formattedMessage,
            instanceLogLevel,
            loguptsConfig,
            message,
            parentFunctionName,
            usedLogLevel
        }: ITransportArgs = demo.customSync();
        chai.expect(customArgs).to.eql(undefined);
        chai.expect(message).to.eql('');
        chai.expect(error).to.eql(undefined);
        chai.expect(formattedMessage).to.eql('');
        chai.expect(usedLogLevel).to.eql(LOGLEVEL.INFO);
        chai.expect(instanceLogLevel).to.eql(LOGLEVEL.WARN);
        chai.expect(parentFunctionName).to.eql('log');
        chai.expect(loguptsConfig).to.be.an('object');
    })
})  