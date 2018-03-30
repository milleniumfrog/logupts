// test for runtime
let runtime =
    (typeof module === 'object' && typeof module.exports === "object") ?
        'commonjs' :
        (typeof define === "function" && define.amd) ?
            'amd' :
            'default';

if (runtime === 'commonjs') {
    let LogUpTs = require('../dist/logupts').LogUpTs;
    let chai = require('chai');
    let path = require('path');
    let Placeholders = require('../dist/logupts').Placeholders;
    test(LogUpTs, Placeholders, path, chai.expect);
} else if (runtime === 'amd') {
    require.config({
        baseUrl: '.',
        paths: {
            dist: '../dist',
            node: '../node_modules'
        }
    });
    require(['logupts', 'node/chai/chai'], (index, chai) => {
        console.log(index);
        test(index.LogUpTs, index.Placeholders, { resolve: () => { return '' } }, chai.expect);
    })
} else  {
    test(window.LogUpTs, window.Placeholders, { resolve: () => { return '' } }, chai.expect);
}

// test function
function test(LogUpTs, Placeholders, path, expect) {
    describe('basic functions', () => {
        it('ersetze platzhalterstring', () => {
            expect((new LogUpTs())._generateStringOutOfPlaceholderString('{{frog}}::{{frog}}::{{service(activeService)}}')).to.equal('milleniumfrog::milleniumfrog::[LOG]');
        });
        it('füge Einstellungen zusammen', () => {
            expect(JSON.stringify((new LogUpTs()).logOptions)).to.equal(JSON.stringify({"placeholders":{"day":{"key":"day","replacer":"30"},"month":{"key":"month","replacer":"03"},"year":{"key":"year","replacer":"2018"},"service":{"key":"service"},"frog":{"key":"frog","replacer":"milleniumfrog"}},"praefix":"{{service(activeService)}} ","postfix":"","quiet":false,"logFiles":[],"writeToFile":false}));
            let log = new LogUpTs({
                placeholders: Placeholders,
                praefix: '{{service(activeService)}} {{day}} ',
                postfix: '',
                quiet: false
            });
            // expect(JSON.stringify(log.logOptions)).to.equal(JSON.stringify({ "placeholders": { "day": { "key": "day", "replacer": "29" }, "month": { "key": "month", "replacer": "03" }, "year": { "key": "year", "replacer": "2018" }, "service": { "key": "service" }, "frog": { "key": "frog", "replacer": "milleniumfrog" } }, "praefix": "{{service(activeService)}} ", "postfix": "", "quiet": false, "logFiles": [] }));
        })
    });
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
        mocha.checkLeaks();
        mocha.run();   
    }
}
