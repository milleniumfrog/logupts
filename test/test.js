// test for runtime
let runtime =
    (typeof module === 'object' && typeof module.exports === "object") ?
        'commonjs' :
        (typeof define === "function" && define.amd) ?
            'amd' :
            'default';

if (runtime === 'commonjs') {
    let logupts = require('../dist/umd/logupts');
    let path = require('path');
    let chai = require('chai');
    test(logupts.LogUpTs, path, chai.expect, logupts.Placeholder, logupts.Runtime);
} else if (runtime === 'amd') {
    require.config({
        paths: {
            node: '../node_modules',
            umd: '../dist/umd',
            cdn: ''
        }
    });
    require(["umd/logupts", 'node/chai/chai'], (logupts, chai) => {
        test(logupts.LogUpTs, (() => { }), chai.expect, logupts.Placeholder, logupts.Runtime);
    });

} else {
    if (window.LogUpTs)
        test(window.LogUpTs, (() => { }), chai.expect, window.Placeholder, window.Runtime);
    else {
        test(logupts.LogUpTs, (() => { }), chai.expect, logupts.Placeholder, logupts.Runtime);
    }
}

// test function
function test(LogUpTs, path, expect, Placeholder, Runtime) {
    let quietOption = {
        quiet: false
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
        describe('small changes', () => {
            it('custom prefix', () => {
                expect((new LogUpTs({quiet: true, praefix: '{{fullYear}} {{service()}} '})).log('hello world'))
                    .to.equal('2018 [LOG] hello world');
            });
            it('add a postfix', () => {
                expect((new LogUpTs({quiet: true, postfix: ' bye'})).log("hello world"))
                    .to.equal('[LOG] hello world bye');
            })
        });
        describe('extend and configure', () => {
            it('custom function', () => {
                let logger = new LogUpTs(quietOption);
                function cu (message) {
                    return logger.custom('[cu] ', '', message);
                }
                expect(cu("hello world")).to.equal('[cu] hello world');
                logger.cu = cu;
                expect(logger.cu("hello world")).to.equal('[cu] hello world');
            });
            it('replace Placeholders', () => {
                let newPlaceholder = {
                    r2d2: new Placeholder('r2d2', 'c3po')
                }
                let log = new LogUpTs(quietOption);
                log.logOptions.placeholders = newPlaceholder;
                expect(log.log("hello world")).to.equal('{{service()}} hello world');
                expect(log.custom('{{r2d2}} ', '', "is a robot")).to.equal('c3po is a robot');
            });
            it('merge Placeholders', () => {
                let newPlaceholder = {
                    r2d2: new Placeholder('r2d2', 'c3po')
                }
                let log2 = new LogUpTs({
                    quiet: true,
                    placeholders: newPlaceholder
                })
                expect(log2.log("hello world")).to.equal('[LOG] hello world');
                expect(log2.custom('{{r2d2}} ', '', "is a robot")).to.equal('c3po is a robot');
            })
            it('add new Placeholders', () => {
                let logger = new LogUpTs(quietOption);
                let placeholders = logger.logOptions.placeholders;
                placeholders.king = new Placeholder('king', (param) => {
                    try {
                        Placeholder.onlyString(param);
                    }
                    catch(err) {
                        throw err;
                    }
                    return param;
                });
                expect(logger.custom('{{king(hello)}} ', '', 'world')).to.equal('hello world');
                try {
                    logger.custom('{{king()}}');
                }
                catch(err) {
                    expect(err.message).to.equal('this placeholder doesn´t supports functions without a string as param');
                }
            });
            it('custom class with debug function', () => {
                class Log extends LogUpTs {
                    constructor(logOptions){
                        super(logOptions);
                    }
                    greet(name){
                        return "hello " + name;
                    }
                    debug(message, options){
                        let opt = options || this.logOptions;
                        this.placeholderVars.activeService = 'DEBUG'; // setze aktivenService auf Log
                        let outPut = this._generateStringOutOfPlaceholderString(opt.praefix) + // setze den String zusammen
                            message +
                            this._generateStringOutOfPlaceholderString(opt.postfix);
                        // log to console
                        if (!opt.quiet)
                            console.log(outPut);
                        if (runtime !== Runtime.commonjs || !opt.writeToFileSystem)
                            return outPut;
                        // nodejs Teil
                        let toPrint = ['ALL', 'DEBUG'];
                        return this.genDirs.then(()=>{return this.node_allFiles(toPrint, outPut)});
                    }
                }
                let l = new Log(quietOption);
                expect(l.log("hello")).to.equal('[LOG] hello');
                expect(l.greet("Rene")).to.equal('hello Rene');
                expect(l.debug('an Error')).to.equal('[DEBUG] an Error');
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
                    })).log('hello world')
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
                it('save custom with Placeholder', () => {
                    let logger = new LogUpTs({
                        quiet: true,
                        writeToFileSystem: true,
                        logFiles: [
                            {
                                identifier: 'cwP',
                                path: path.resolve(__dirname, '../log/custom'),
                                fileName: 'c.log',
                                serviceToLog: ['LOG', '{{fullYear}} ']
                            }
                        ]
                    });
                    return logger.log("hello world")
                        .then(() => {
                            return logger.custom('{{fullYear}} ', '', 'hello world');
                            
                        })
                })
            })
        })
    } else {
        mocha.run();
    }
}