let logupts = require('../dist/umd/logupts').LogUpTs;
let logupTsTransportFile = require('../dist/umd/logupts-transport-file').LogUpTsTransportFile;
let path  = require('path');

describe('run logs', () => {
    it ('', () => {
        let logger = new logupts({quiet: true});
        logger.loguptsOptions.transports[0] = new logupTsTransportFile(
            path.resolve(__dirname, 'log'), '{{date}}.log', logger, ['ALL']
        )
        return logger.log('hello')
            .then(() => {
                return logger.log('bye');
            })
    });
    it ('', () => {
        let logger = new logupts({quiet: true});
        logger.loguptsOptions.transports[0] = new logupTsTransportFile(
            path.resolve(__dirname, 'log'), '{{date}}.log', logger, ['ALL']
        )
        for (let i = 0; i < 100; ++i) {
            logger.log(String(i));
        }
    });
    it ('', () => {
        let logger = new logupts({quiet: true});
        logger.loguptsOptions.transports[0] = new logupTsTransportFile(
            path.resolve(__dirname, 'log'), '{{date}}.err.log', logger, ['ERROR']
        )
        for (let i = 0; i < 100; ++i) {
            logger.log(String(i));
        }
        logger.error('runned');
    });
})