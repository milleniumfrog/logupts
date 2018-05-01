# LogUpTs v2

Version: 2.0.x

LogUpTs is an extendable class, which logs your messages with a customizable prefix and postfix to your console. A template system and a few predefined placeholders enable you to create timestamps with an easy syntax like this: "{{date}}:{{month}}:{{fullYear}}"=>"30.04.2018". You are also able to extend the placeholders with redefinitions and new ones. If you want to store the logs, the class has a transport layer which enables you to use plugins to save or send the log data. In this repository is the plugin logupts-transport-file included.

- [install logupts](#install)
- [setup](#setup)
- [configuration](#config)
- extend LogUpTs (will follow soon)

# install <a name="install"></a>
```bash
npm i logupts --save
```
or use one of this links: 
- no module loader: https://dev.milleniumfrog.de/cdn/logupts/2.0.0/browser/logupts.min.js
- require.js: https://dev.milleniumfrog.de/cdn/logupts/2.0.0/browser/logupts.amd.min.js
- es2015 modules: https://dev.milleniumfrog.de/cdn/logupts/2.0.0/browser/logupts.es2015.min.js

# setup <a name="setup"></a>
You can use the module in typescript and javascript.

typescript default:
```typescript
import { LogUpTs } from 'logupts';
let logger:LogUpTs = new LogUpTs();
```
typescript umd/commonjs/amd as module system:
```typescript
import { LogUpTs } from 'logupts/dist/umd/logupts';
let logger:LogUpTs = new LogUpTs();
```
javascript nodejs:
```javascript
let logupts = require('logupts/dist/umd/logupts');
let logger = new logupts.LogUpTs();
```
javascript amd browser:
```javascript
require.config({
    paths: {
        cdn: "https://dev.milleniumfrog.de/cdn/logupts/2.0.0/browser"
    }
});
require(['cdn/logupts.amd'], (loguptsAMD) => {
	let logger = loguptsAMD.LogUpTs();
})
```
[example for amd/es2015/no module](https://codepen.io/milleniumfrog/pen/LmWqNO)

# configuration <a name="config"></a>
### custom prefix:
The actual prefix is {{service}} and shows used function like log, error, warn ..., but sometimes you need something like a timestamp. You can assign a new string to the loguptsOptions.prefix variable like this.
```javascript
let logger = new LogUpTs();
logger.loguptsOptions.prefix = '{{fullYear}} {{service}} ';
logger.log("hello") // 2018 [LOG] hello
```
As you can see, placeholders are useable.

### custom postifx
see custom prefix
```javascript
let logger = new LogUpTs();
logger.loguptsOptions.postfix = ' {{fullYear}}';
logger.log("hello") // [LOG] hello 2018
```

### quiet
if it shouldn´t log to console you can forbit it with the quiet option.
```javascript
let logger = new LogUpTs();
logger.loguptsOptions.postfix = ' {{fullYear}}';
logger.log("hello") // no output on console
```

### placeholders
if you dont need all predefined placeholders you can delete a few.
```javascript
let logger = new LogUpTs();
delete logger.loguptsOptions.placeholders.service;
logger.log("hello") // {{service}} hello
```
or add new placeholders
```javascript
let logger = new LogUpTs();
logger.loguptsOptions.placeholders.pu = new Placeholder('pu', 'world');
logger.log("hello {{pu}}") // [LOG] hello world
```
or redefine an existing one
```javascript
let logger = new LogUpTs();
logger.loguptsOptions.placeholders.service = new Placeholder('service', '[world]')
logger.log("hello ") // [world] hello
```
### custom (async) function executions
you can inject function that will executed whenever log-function is used.
As example I implemented a counter
```javascript
let counter = 0;
let logger = new LogUpTs();
logger.loguptsOptions.customExecutions.push(() => {++counter});
logger.log("hello") // [LOG] hello
logger.log(String(counter))
```
if you use an asynchronous function the log-function will return a promise.
```javascript
let counter = 0;
let logger = new LogUpTs();
logger.loguptsOptions.customAsyncExecutions.push(() => {++counter; return Promise.resolve()});
logger.log("hello") // [LOG] hello
  .then(() => {
  logger.log(String(counter))
})
```

### transport plugins
Without plugins LogUpTs will only log to your console, but with plugins you can log and store your
log everywhere. For nodejs I already included a plugin which enables you to save your log to files.
```typescript
// typescript code for macos and linux (not for windows)
import { LogUpTs } from 'logupts/dist/umd/logupts';
import { LogUpTsTransportFile } from 'logupts/dist/umd/logupts-transport-file';
import * as path from 'path';

let logger = new LogUpTs();

logger.loguptsOptions.transports = [
	/** arguments:
 	 * 1: absoulte path where the files should get stored (without placeholders)
	 * 2: filename (if you want with placeholders, the files get automatically generated)
	 * 3: pass your LogUpTs instance to the plugin
	 * 4: what should get logged (LOG, ERROR, WARN, INFO, ALL are possible)
	 */
	new LogUpTsTransportFile(path.resolve(__dirname, 'log'), 'test.log', logger, ['ALL'])
]
logger.log("hello");
/** the file test.log appears with following content: 
 * [LOG] hello
 */ 
```
If you want to create your own transport plugin you have to create a class that implements the interface 
Transport from the logupts module.
Here you can look at the LogUpTsTransportFile-Plugin as [example](./src/logupts-transport-file.ts).

# extend is WIP

### Author
René Schwarzinger (milleniumfrog)

[License](./LICENSE) MIT