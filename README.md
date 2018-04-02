# LogUpTs 

Version: 1.0.6

LogUpTs is an extendable class, which logs your message with a generated prefix and postfix. The prefix and postfix strings have the possibility to add Placeholder that will be replaced when the script executes. For example, you log 'hello world' with the following prefix: '{{month}}:{{year}} {{service()}}'. The result would be '03:2018 [LOG] hello world'.
In Nodejs you can also save your log to diffrent files.
# start with logupts

install it via npm 
```bash
npm install --save logupts
```
or use the cdns
- https://dev.milleniumfrog.de/cdn/logupts/1.0.6/browser/logupts.js for including via \<script src=\"\"\>
- https://dev.milleniumfrog.de/cdn/logupts/1.0.6/umd/logupts for including via AMD
- https://dev.milleniumfrog.de/cdn/logupts/1.0.6/es2015/logupts.js for including as es2015 Module
## [Nodejs](https://runkit.com/embed/kudu66eglz9n) 
```javascript
let LogUpTs = require('logupts').LogUpTs // import the LogUpTs class
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
<script src="https://dev.milleniumfrog.de/cdn/logupts/1.0.6/browser/logupts.js"></script>
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
        cdn: 'https://dev.milleniumfrog.de/cdn/logupts/1.0.6/umd'
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
import { LogUpTs } from 'https://dev.milleniumfrog.de/cdn/logupts/1.0.6/es2015/logupts.js';
let logger = new LogUpTs(); // create your logger object
logger.log("hello world") // log to console
logger.info("this is an info") // log an info to console
...
```

[Click here for an expamle with AMD and ES2015 Module](http://plnkr.co/edit/PC4upgfoKlcXZHxYhdSx?p=info)

## String Placeholders
In the prefixes and postfixes, you can add placeholders that get replaced when you log your file. A Placeholder is surrounded by curly brackets like this {{placeholder}}.
Actual Placeholder:

(Date Placeholders)
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

## write logfiles (nodejs and mac/linux only)
When you create the logger Object you can setup your logfiles like this
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
The code snippet above creates two files and logs everything in the first file and in the second file it only logs messages when the log-function is used. As you can see you can include Placeholders in the Filename, but dont include Placeholders in the directory paths, this will not work. 
If you want to log everything in your File just set serviceToLog to ['ALL']

## DOC
You can create a documentation to the class with
```bash
npm run doc 
```
in the rootdir, its written in a mixture of german and english.



### Author
René Schwarzinger (milleniumfrog)

[License](./LICENSE) MIT