// test for runtime
let runtime =
    (typeof module === 'object' && typeof module.exports === "object") ?
        'commonjs' :
        (typeof define === "function" && define.amd) ?
            'amd' :
            'default';

if (runtime === 'commonjs') {
    let LogUpTs = require('../dist/umd/logupts').LogUpTs;
    let path = require('path');
    let chai = require('chai');
    test(LogUpTs, path, chai.expect);
} else if (runtime === 'amd') {
    require.config({
        paths: {
            node: '../node_modules',
            umd: '../dist/umd',
            cdn: 'https://dev.milleniumfrog.de/cdn/logupts/1.0.5/umd'
        }
    });
    require(["cdn/logupts", 'node/chai/chai'], (logupts, chai) => {
        test(logupts.LogUpTs, (() => { }), chai.expect);
    });

} else {
    if (window.LogUpTs)
        test(window.LogUpTs, (() => { }), chai.expect);
    else {
        test(logupts.LogUpTs, (() => { }), chai.expect);
    }
}

// test function
function test(LogUpTs, path, expect) {
    let quietOption = {
        quiet: true
    }
    describe('Client and Nodejs', () => {
        describe('return a string, default string', () => {
            it('log', () => {
                expect((new LogUpTs(quietOption)).log('hello world')).to.equal('[LOG] hello world');
            })
            it('info', () => {
                expect((new LogUpTs(quietOption)).info('hello world')).to.equal('[INFO] hello world');
            })
            it('error', () => {
                expect((new LogUpTs(quietOption)).error('hello world')).to.equal('[ERROR] hello world');
            })
            it('custom', () => {
                expect((new LogUpTs(quietOption)).custom('hello world', 'a log', ' i am ')).to.equal('hello world i am a log');
            })
        })
        describe('extend via custom functions', () => {
            it ('custom function', () => {
                let logger = new LogUpTs(quietOption);
                function cu (message) {
                    return logger.custom('[cu] ', '', message);
                }
                expect(cu("hello world")).to.equal('[cu] hello world')
            })
        });
    });


    if (runtime === 'commonjs') {
        // 
        describe('Nodejs only', () => {
            describe('save into files', () => {
                it('log hello world', () => {
                    return (new LogUpTs({
                        quiet: true,
                        writeToFileSystem: true,
                        logFiles: [
                            {
                                identifier: "test",
                                path: path.resolve(__dirname, '../log/'),
                                fileName: 'test_{{fullYear}}.log',
                                serviceToLog: ['ALL']
                            },
                            {
                                identifier: "test2",
                                path: path.resolve(__dirname, '../log/test2'),
                                fileName: 'test2_{{fullYear}}.log',
                                serviceToLog: ['[CONSTRUCTOR]']
                            }
                        ]
                    })).custom('[CONSTRUCTOR]', '','hello world')
                        .then((finalString) => {
                            expect(finalString).to.equal('[LOG] hello world');
                        })
                })
                it('complexer log', () => {
                    let log = new LogUpTs({
                        quiet: true,
                        writeToFileSystem: true,
                        logFiles: [{
                            identifier: 'infos',
                            path: path.resolve(__dirname, '../log/info'),
                            fileName: 'info.log',
                            serviceToLog: ['INFO']
                        },
                        {
                            identifier: 'log',
                            path: path.resolve(__dirname, '../log/log'),
                            fileName: 'log.log',
                            serviceToLog: ['LOG']
                        },
                        {
                            identifier: 'all',
                            path: path.resolve(__dirname, '../log/all'),
                            fileName: 'all.log',
                            serviceToLog: ['ALL']
                        }]
                    });

                    return log.log('das ist ein Log')
                        .then(() => {
                            return log.info('das ist eine Info')
                        })
                        .then(() => {
                            return log.error('das ist ein Fehler')
                        })
                        .then(() => {
                            return log.error(new Error('this is a error'));
                        })
                        .then(() => {
                            return log.custom('[PING] ', '', 'a custom message')
                        })
                })
            })
        })
    } else {
        mocha.run();
    }
}