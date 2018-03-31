// test for runtime
let runtime =
    (typeof module === 'object' && typeof module.exports === "object") ?
        'commonjs' :
        (typeof define === "function" && define.amd) ?
            'amd' :
            'default';

if (runtime === 'commonjs') {
    let LogUpTs = require('../dist/umd/logupts').LogUpTs;
    let Placeholders = require('../dist/umd/logupts').Placeholders;
    let path = require('path');
    let chai = require('chai');
    test(LogUpTs, Placeholders, path, chai.expect);
} else if (runtime === 'amd') {
    require.config({
        paths: {
            node: '../node_modules'
        }
    });
    require(['', 'node/chai/chai'], (logupts, chai) => {
        console.log(logupts);
        console.log(chai);
    });
   
} else {
    test(window.LogUpTs, window.Placeholders, (() => {}), chai.expect);
}

// test function
function test(LogUpTs, Placeholders, path, expect) {
    if (runtime === 'commonjs') {
        // 
        describe('Nodejs only with saving in files', () => {
            it('log hello world', () => {
                return (new LogUpTs({
                    quiet: true,
                    writeToFile: true,
                    logFiles: [
                        {
                            identifier: "test",
                            path: path.resolve(__dirname, '../log/'),
                            fileName: 'test_{{year}}.log',
                            serviceToLog: ['ALL']
                        },
                        {
                            identifier: "test2",
                            path: path.resolve(__dirname, '../log/test2'),
                            fileName: 'test2_{{year}}.log',
                            serviceToLog: ['LOG']
                        }
                    ]
                })).log('hello world')
                    .then((finalString) => {
                        expect(finalString).to.equal('[LOG] hello world');
                    })
            })
            it ('complexer log', () => {
                let log = new LogUpTs({
                    quiet: true,
                    writeToFile: true,
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
    }
    else { 
        // Client tests
        let quietOption = {
            quiet: true
        }
        describe('client', () => {
            it ('gibt String [LOG] hello world zurück', () => {
                expect((new LogUpTs(quietOption)).log('hello world')).to.equal('[LOG] hello world');
            })
            it ('info', () => {
                expect((new LogUpTs(quietOption)).info('hello world')).to.equal('[INFO] hello world');
            })
            it ('error', () => {
                expect((new LogUpTs(quietOption)).error('hello world')).to.equal('[ERROR] hello world');
            })
            it ('custom', () => {
                expect((new LogUpTs(quietOption)).error('hello world')).to.equal('[ERROR] hello world');
            })
        });
        mocha.run();   
    }
}
