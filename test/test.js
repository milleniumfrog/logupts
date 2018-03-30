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
            expect(JSON.stringify((new LogUpTs()).logOptions)).to.equal(JSON.stringify({
                placeholders: Placeholders,
                praefix: '{{service(activeService)}} ',
                postfix: '',
                quiet: false,
                logFiles: []
            }));
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
        describe('Nodejs only', () => {
            it('log hello world', () => {
                return (new LogUpTs({
                    // quiet: true,
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
        })
    }
    else { 
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
