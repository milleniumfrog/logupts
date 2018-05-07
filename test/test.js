let logupts = require('../dist/umd/logupts').LogUpTs;
let logupTsTransportFile = require('../dist/umd/logupts-transport-file').LogUpTsTransportFile;
let path  = require('path');

describe('run logs', () => {
    it ('log hello and bye to console and save it in {{date}}.log', () => {
        let logger = new logupts({quiet: true});
        logger.loguptsOptions.transports[0] = new logupTsTransportFile(
            path.resolve(__dirname, 'log'), '{{date}}.log', logger, ['ALL']
        )
        return logger.log('hello')
            .then(() => {
                return logger.log('bye');
            })
    });
    it ('log the Number 0-99 and save in file, log an error after that', () => {
        let logger = new logupts({quiet: true});
        let PromArr = [];
        logger.loguptsOptions.transports[0] = new logupTsTransportFile(
            path.resolve(__dirname, 'log'), '{{date}}.log', logger, ['ALL']
        )
        for (let i = 0; i < 100; ++i) {
            PromArr.push(logger.log(String(i)));
        }
        PromArr.push(logger.error('runned'));
        return Promise.all(PromArr);
    });
    it ('only log the error', () => {
        let logger = new logupts({quiet: true});
        let PromArr = [];
        logger.loguptsOptions.transports[0] = new logupTsTransportFile(
            path.resolve(__dirname, 'log'), '{{date}}.error.log', logger, ['ERROR']
        )
        for (let i = 0; i < 100; ++i) {
            PromArr.push(logger.log(String(i)));
        }
        PromArr.push(logger.error('runned'));
        return Promise.all(PromArr);
    });
})