# LogUpTs 

Version: 1.0.9

LogUpTs is an extendable class, which logs your message with a generated prefix and postfix. The prefix and postfix strings have the possibility to add Placeholder that will be replaced when the script executes. For example, you log 'hello world' with the following prefix: '{{month}}:{{year}} {{service()}}'. The result would be '03:2018 [LOG] hello world'.
In Nodejs you can also save your log to different files.

- [install logupts](#install)
- [setup](#setup)
- [extend](#extend)

# install logupts <a name="install"></a>

install it via npm 
```bash
npm install --save logupts
```
or use the following links
- https://dev.milleniumfrog.de/cdn/logupts/1.0.9/browser/logupts.js for including via \<script src=\"\"\>
- https://dev.milleniumfrog.de/cdn/logupts/1.0.9/umd/logupts for including via AMD
- https://dev.milleniumfrog.de/cdn/logupts/1.0.9/es2015/logupts.js for including as es2015 Module

# Setup LogUpTs <a name="setup"></a>

## Typescript
```javascript
import { LogUpTs, ILogUpTsOptions } from 'logupts';
let logger:LogUpTs = new LogUpTs();
```

## Nodejs

```javascript
let LogUpTs = require('logupts/dist/umd/logupts').LogUpTs // import the LogUpTs class
let logger = new LogUpTs(); // create your logger object
logger.log("hello world") // log to console
logger.info("this is an info") // log an info to console
logger.error("this is an error") // or
logger.error((new Error("this is also an error"))) // log an error
logger.custom("BSP ", "", "this is a custom message") // log a message with custom praefix and postfix
```
[Click here for an example](https://runkit.com/embed/kudu66eglz9n) 

## Browser
### Without module loader
```html
<script src="https://dev.milleniumfrog.de/cdn/logupts/1.0.9/browser/logupts.js"></script>
```
```javascript
let logger = new logupts.LogUpTs();
logger.log("this is a log");
logger.info("this is an info");
logger.error("this is an error");
logger.error(new Error("this is also an error"));
logger.custom('[CUSTOM] ', '', 'this is a custom message');
logger.custom('[{{day}}] ', '', 'this is a custom message');
```
[Click here for an example](http://plnkr.co/edit/9TAGQmipjFNVWUtHVa9X?p=preview)
### AMD
```javascript
require.config({
    paths: {
        cdn: 'https://dev.milleniumfrog.de/cdn/logupts/1.0.9/umd'
        // or cdn: 'https://dev.milleniumfrog.de/cdn/logupts/1.0.9/browser/amd'
    }
});
require(["cdn/logupts"], (logupts, chai) => {
    let logger = new logupts.LogUpTs(); // create your logger object
    logger.log("hello world") // log to console
    logger.info("this is an info") // log an info to console
    logger.error("this is an error") // or
    logger.error((new Error("this is also an error"))) // log an error
    logger.custom("AMD ", "", "this is a custom message") // log a message withcustom praefix and postfix
    logger.custom("[AMD] ", "", "this is a custom message") // log a message withcustom praefix and postfix
    logger.custom("{{day}} ", "", "this is a custom message") // log a messagewith custom praefix and postfix
});
```
### ES2015 Modules
index.html
```HTML
<script type="module" src="index.js"></script>
```
index.js
```javascript
import { LogUpTs } from 'https://dev.milleniumfrog.de/cdn/logupts/1.0.9/browser/es2015/logupts.js';
let logger = new LogUpTs(); // create your logger object
logger.log("hello world") // log to console
logger.info("this is an info") // log an info to console
...
```

[Click here for an expamle with AMD and ES2015 Module](http://plnkr.co/edit/PC4upgfoKlcXZHxYhdSx?p=info)

## Placeholders

Placeholders are a predefined, but easy extendable, Group of words, which get replaced with predefined values or the returning value of a function. Placeholders are surrounded by double curly brackets. {{...}}
A timestamp, for example, would be '{{day}}.{{month}}.{{fullYear}} {{hours}}:{{minutes}}', the result would be 01.04.2018 17:51. 

The default Prefix is '{{service()}}'

Timestamp placeholder
- date
- day
- month
- fullYear
- hours
- minutes
- seconds

(other Placeholders)
- frog
- service()

internal placeholder variables
- activeService

## write logfiles (nodejs and mac/linux only)
When you create an object you can setup your logfiles like this
```javascript
new LogUpTs({
    quiet: true, // disable the output to console (default = false)
    writeToFileSystem: true, // activate writing to File System
    logFiles: [ // define log paths and what should get logged
        {
            identifier: "test",
            path: path.resolve(__dirname, '../log/'), // absolute path !!!
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
        });
```
The code snippet above creates two files and logs everything in the first file and in the second file it only logs messages when the log-function is used. 
As you can see you can include Placeholders in the Filename, but don't include Placeholders in the directory paths, this will not work. 
If you want to log everything in your File just set serviceToLog to ['ALL']

# Extend LogUpTs <a name="extend"></a>

## create a new logging function with custom()
To easiest way to extend the class is to use the custom() function. You can set a static prefix and postfix in a new function and pass a message from the new function to the message argument at the custom function. You could add the new function to an existing instance of LogupTs.
This would look like this:
```javascript
let log = new LogUpTs();
function newFunc(message) {
    return log.custom('[newFunc] ', ' [/newFunc]', message);
}
log.newFunc = newFunc;
```

## manage the placeholders
### replace the existing placeholders
To replace the placeholders you need a new placeholder object and a 
LogUpTs instance. Then you can replace the under 
instance.logOptions.placeholders the default placeholder object with your new object.
```javascript
let newPlaceholder = {
    r2d2: new Placeholder('r2d2', 'c3po')
   }
let log = new LogUpTs(quietOption);
log.logOptions.placeholders = newPlaceholder;
```

### add new placeholders
If you want to add new placeholders you can use the already existing placeholder object and add a new property. please use the same property name as your placeholder key (first argument of the Placeholder constructor), so can you avoid name collisions.
```javascript
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
```
### merge new with exsting placeholders
```javascript
let newPlaceholder = {
    r2d2: new Placeholder('r2d2', 'c3po')
}
let log2 = new LogUpTs({
    quiet: true,
    placeholders: newPlaceholder
})
```
## newClass extends LogUpTs
```javascript
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
        let outPut = this._generateStringOutOfPlaceholderString(opt.praefix) +
            message +
            this._generateStringOutOfPlaceholderString(opt.postfix);
        // log to console
        if (!opt.quiet)
            console.log(outPut);
        if (runtime !== Runtime.commonjs || !opt.writeToFileSystem)
            return outPut;
        // nodejs part
        let toPrint = ['ALL', 'DEBUG'];
        return this.genDirs.then(()=>{return this.node_allFiles(toPrint, outPut)});
    }
}
```

## DOC
You can create a documentation to the class with
```bash
npm run doc 
```
in the rootdir, its written in a mixture of german and english.



### Author
René Schwarzinger (milleniumfrog)

[License](./LICENSE) MIT