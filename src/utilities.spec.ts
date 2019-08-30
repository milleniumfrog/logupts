import chai from 'chai';
import { LOGLEVEL } from './loglevel';
import { logLevelMapper } from './utilities';

describe('utilities', () => {
    it('function logLevelMapper', () =>  {
        chai.expect(logLevelMapper(LOGLEVEL.INFO)).to.eql('info');
        chai.expect(logLevelMapper(LOGLEVEL.WARN)).to.eql('warn');
        chai.expect(logLevelMapper(LOGLEVEL.DEBUG)).to.eql('debug');
        chai.expect(logLevelMapper(LOGLEVEL.TRACE)).to.eql('trace');
        chai.expect(logLevelMapper(LOGLEVEL.ERROR)).to.eql('error');
    })
})