# THE DOCUMENTATION IS WIP
# LogUpTs 

Version: 1.0.5

LogUpTs is an extendable class, which logs your message with a generated prefix and postfix. The prefix and postfix strings have the possibility to add Placeholder that will be replaced when the script executes. For example, you log 'hello world' with the following prefix: '{{month}}:{{year}} {{service(activeService)}}'. The result would be '03:2018 [LOG] hello world'.
In Nodejs you can also save your log to diffrent files.
## start with logupts

### [Nodejs](https://runkit.com/embed/kudu66eglz9n) 
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
### AMD
```javascript
    require.config({
        paths: {
            node: PATH_TO_NODE_MODULES,
        }
    });
    require(['node/logupts/dist/umd/logupts'], (logupts) => {
        let LogUpTs = logupts.LogUpTs();
        let logger = new LogUpTs(); // create your logger object
        logger.log("hello world") // log to console
        ...
    })
```
### ES2015 Modules
index.html
```HTML
<script type="module" src="index.js"></script>
```
index.js
```javascript
import { LogUpTs } from PATH_TO_NODE_MODULES + '/logupts/dist/es2015/logupts.js';
let LogUpTs = logupts.LogUpTs();
let logger = new LogUpTs(); // create your logger object
logger.log("hello world") // log to console
...
```

[Click here for an expamle with AMD and ES2015 Module](http://plnkr.co/edit/PC4upgfoKlcXZHxYhdSx?p=info)

## String Placeholders
In the prefixes and postfixes, you can add placeholders that get replaced when you log your file. A Placeholder is surrounded by curly brackets like this {{placeholder}}.
Actual Placeholder:
- day 
- month
- year
- frog
- service(activeService)

## write logfiles (nodejs and mac/linux only)
When you create the logger Object you can setup your logfiles like this
```javascript
new LogUpTs({
    quiet: true,
    writeToFile: true, // activate writing to File System
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

## DOC
You can create a documentation to the class with
```bash
npm run doc 
```
in the rootdir.

### Author
René Schwarzinger (milleniumfrog)

[License](./LICENSE) MIT