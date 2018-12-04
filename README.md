# LogUpTs v3.0.x

[![](https://data.jsdelivr.com/v1/package/npm/logupts/badge)](https://www.jsdelivr.com/package/npm/logupts)

LogUpTs is an easy extendable Logging Library for the browser and nodejs.
It supports Logging to files or (with plugins) to other destinations.
Additionally LogUpTs comes with support for placeholders for example the year, month, day, ....
So it's easy to create timestamps or pass other important data to the logs without manually
merging strings.

## Installation
### npm:
```bash
$ npm install --save logupts
```
### cdn:
browser: via script
```html
<script src="https://cdn.jsdelivr.net/npm/logupts@3/dist/browser/logupts.min.js"></script>
<script>
	const logger = new logupts.LogUpTs();
	logger.log("hello world");
</script>
```
browser: via amd
```javascript
require.config({
   paths:{ 
     logupts:"//cdn.jsdelivr.net/npm/logupts@3/dist/browser/logupts.min"
   }
});
require( ['logupts'], ( logupts ) => {
    let logger = new loguptspackage.LogUpTs();
  	logger.log("hello world");
} )
```
es2015 version for bundlers: (also for typescript)
```javascript
import { LogUpTs } from 'logupts';
...
```
## Quick start
An example typescript/javascript (for javascript just ignore types) code:
```typescript
import { LogUpTs } from 'logupts';
const logger = new LogUpTs();
// just log to console
logger.log( 'hello world' );
logger.error( 'a wild error appeared' );
logger.error( new Error( 'a second error' ) );
// use returned string promise
logger.warn( 'test' ).then( (value: string) => { return value === "[WARN] test" } );
// use await/async
(async (): Promise<boolean> => {
	const test = await logger.log("hello world");
	return test === "[LOG] hello world2";
})();
logger.log( '{{year}}' );
```
console output:
```bash
[LOG] hello world
[ERROR] a wild error appeared
[ERROR] a second error
	at ...
	at Generator.next (<anonymous>)
	at ...
[WARN] test
[LOG] hello world2
[LOG] 2018
```
## Configurations
As you can see in the example above has every log entry a prefix (here LOG, ERROR, WARN).
You can change the prefix in this way.
```typescript
const noPrefix: LogUpTsOptions = { prefix: '' }; // for no prefix
const timestampPrefix: LogUpTsOptions = { prefix: '{{year}}.{{month}}.{{date}}:{{hours}}.{{minutes}}.{{seconds}}' }; // 2018.01.01:13.25.23
```
see here the LogUpTsOptions type:
```typescript
export interface LogUpTsOptions<T = LogUpTsTemplateTypeInterface> {
    /** set the prefix */
    prefix?: string;
    /** postfix */
    postfix?: string;
    /** all Placeholders */
    placeholders?: Placeholder[];
    /** supress console output */
    quiet?: boolean;
    /** write to File or other destinations */
    transports?: Transport[];
    /** execute custom functions when calling the function */
    customFunctions?: (( param: string, internals: T, options: LogUpTsOptions<T> ) => Promise<void>)[];
    /** log, warn, error, ... */
    logType?: string;
    /** log error.stack to console */
	logStack?: boolean;
	/** set loglevel  */
	logLevel?: LOGLEVEL;
}
 export enum LOGLEVEL {
	TRACE, 
	DEBUG,
	INFO,
	WARN,
	ERROR,
	OFF
 }
```
To Configure Logupts you create an object that matches this interface and pass it when you create a LogUpTs-instance.

## Write to files:
```typescript
import { LogUpTs, LogUpTsOptions } from 'logupts';
import { FileTransport, FileInternals } from 'logupts/dist/es2015/file-transport';
let options: LogUpTsOptions = {
    transports: [ new FileTransport( 'test1.log', '../log', [ 'ALL' ] ) ],
    quiet: true,
}
let internals: any & FileInternals = {
}
let logger: LogUpTs = new LogUpTs( options, internals );
logger.log( 'begin file' );
for ( let i = 0; i < 100; i++ ) {
    await logger.log( i+2 + 'Zeile' );		// u need the await or it can happen that the order is not correct.
}
logger.log( 'end file' );
```
The example above shows how to use transports and in particular how to use the file transport plugin.
A Transport is an object that matches this interface:
```typescript
export interface Transport< T = LogUpTsTemplateTypeInterface > {
    exec: ( transportOptions: T, str: string ) => Promise<void>;
}
```
If you want to create your own transport plugins you can study file-transport.ts in the source folder.

## Extending LogUpTs
As we mentioned earlier logupts is easy to extend. You can create functions that redirect to loguptsfunctions.
for example (snipped from my tests)
```typescript
it( 'create custom function with logger.custom', async () => {
	const logger = new LogUpTs( { quiet: true } );
	const log = ( msg: string ) => logger.log( msg );
	const error = (msg: string ) => logger.error( msg );
	const page = ( msg: string ) => logger.custom( {},  {service: 'PAGE' }, msg );
	expect( await log( 'first' ) ).to.eql( '[LOG] first' );
	expect( await error( 'second' ) ).to.eql( '[ERROR] second' );
	expect( await page( 'third' ) ).to.eql( '[PAGE] third' );
} );
```
As you can see we create the new function "page. page invokes the function logger.custom, which you
pass an object of type loguptsoption and an object that contains variables for placeholders/transports 
(here we passed {service: 'PAGE' } for our {{service}} Placeholder) and the text we want to print. 
The functions log, error and warn also base on custom as you can see in the code below.
```typescript
// implementation from error
public async error( error: string | Error, customOptions?: LogUpTsOptions<T> ): Promise<string> {
    let opt = this.mergeOptions( customOptions || {} );
    // set logtype to error -> console.error(str)
    opt.logType = 'error';
    let str = error instanceof Error ? `${error.message}${ (opt.logStack && error.stack !== undefined) ? '\n' + error.stack : ''}` : error;
    return  this.custom( opt, { service: 'ERROR' }, str, LOGLEVEL.ERROR );
}
```

Because LogUpTs is a class you can extend LogUpTs via extending the class
```typescript
it( 'extend the class', async () => {
	class eLogUpTs extends LogUpTs {
		public functionCounter: number;
		constructor() {
			super( { quiet: true } );
			this.functionCounter = 0;
		}
		async page( msg: string ) {
			++this.functionCounter;
			return this.custom( this.options, Object.assign( this.internals, { service: 'PAGE' } ), msg, LOGLEVEL.INFO );
		}
		async log( msg: string ) {
			++this.functionCounter;
			return super.log( msg );
		}
	}
	const logger = new eLogUpTs();
	await logger.log( 'first' );
	expect( await logger.page( 'second' ) ).to.eql( '[PAGE] second' );
	await logger.warn( 'third' );											// doesnt increase functioncounter
	expect( logger.functionCounter ).to.eql( 2 ); 
} );
```

## Placeholders
Above we talked a few times about placeholders, that are patterns in strings that get replaced.
You can use the default Placeholders we included in this package:

- year
- month
- date
- day
- hours
- minutes
- seconds
- service

or create your own
```typescript
export interface Placeholder {
    keys: Array<string>;
    replacer: ((str?: string, passArguments?: any) => string);
    flags: string;
    called?: boolean;
}
```
like this:
```typescript
const placeholder: Placeholder = {
    keys: ['{{year}}'],
    replacer: () => {
        return `${(new Date()).getFullYear()}`;
    },
    flags: 'g'
};
```



## Any problem
report your [Issues here](https://github.com/milleniumfrog/logupts/issues)
## Any question
write me an email: [web@milleniumfrog.de](mailto:web@milleniumfrog.de)
## Any idea
write me an email: [web@milleniumfrog.de](mailto:web@milleniumfrog.de)
