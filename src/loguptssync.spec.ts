import { LogUpTsSync, ITransport, ITransportArgs, LOGLEVEL } from './loguptssync';
import * as chai from 'chai';
import { IFormatArgs } from './formatter';

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
    });

    it('log an error', () => {
        const demo = new LogUpTsSync({logLevel: LOGLEVEL.OFF});
        chai.expect(demo.error(new Error('this is an error'))).to.eql('this is an error');
        chai.expect(demo.error('this is an error')).to.eql('this is an error');
        chai.expect(demo.error({error: new Error('this is an error'),
            config: {
                prefix: 'ERROR',
            },
            formatter: {
                format({prefix, parentFunctionName}: IFormatArgs) {
                    return `${prefix} + ${parentFunctionName}`;
                }
            }
        })).to.eql('ERROR + error');
    });
    it('log a warning', () => {
        const demo = new LogUpTsSync({logLevel: LOGLEVEL.OFF});
        chai.expect(demo.warn('this is a warning')).to.eql('this is a warning');
    });
    it('log an info', () => {
        const demo = new LogUpTsSync({logLevel: LOGLEVEL.OFF});
        chai.expect(demo.info('this is an info')).to.eql('this is an info');
        chai.expect(demo.log('this is an info')).to.eql('this is an info');
    });
    it('log an trace', () =>  {
        const demo = new LogUpTsSync({logLevel: LOGLEVEL.OFF});
        chai.expect(demo.trace('test is a trace')).to.eql('test is a trace');
    });
    it('log an debug', () =>  {
        const demo = new LogUpTsSync({logLevel: LOGLEVEL.OFF});
        chai.expect(demo.debug('test is a debug')).to.eql('test is a debug');
    });
})  