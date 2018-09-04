# LogUpTs 

Version: 3.0.x Beta

LogUpTs is designed as an extendable logging library for nodejs and the browser in typescript, but it is also usable in javascript.
With LogUpTs you are able to use placeholders ("{{day}}:{{month}}:{{year}}" -> "01.01.1970 )
and transports (for example the file transport).

## INSTALLATION
### Typescript
Supported Modules: ES2015, AMD, COMMONJS
```bash
npm install --save logupts
```
```typescript
// ES2015
import { LogUpTs } from 'logupts';
// UMD -> AMD and COMMONJS
import { LOGUPTS } from 'logupts/dist/umd/logupts';

```
### Javascript Doc <- Work in Progress

## Usage
### Basic
```typescript
let logger: LogUpTs = new LogUpTs();
logger.log( "hello world" ); // [LOG] hello world
logger.warn( "hello world" ); // [WARN] hello world
logger.error( "this is an error" ); // [ERROR] this is an error
let err: Error = new Error( "a new Error" );
logger.error( err ); // [ERROR] a new Error ...
```
### Configuration
this are the default options for logupts
```typescript
const defaultOptions: LogUpTsOptions = {
    prefix: '{{service}} ',
    postfix: '',
    placeholders: DefaultPlaceholders,
    quiet: false,
    transports: [],
    customFunctions: [],
    logType: 'log',
    logStack: true,
};
let logger: LogUpTs = new LogUpTs( defaultOptions );
```

one of my favorite configurations:
```typescript
let options: LogUpTsOptions = {
    transports: [  new FileTransport( 'test2.log', '../log', [ 'ERROR' ] ) ],
    prefix: "{{service}} [MYFILE.ts]"
};
let logger: LogUpTs = new LogUpTs( options ); 
```

## Placeholders
LogUpTs has a small string replacement library, which enables you to use placeholders like {{service}} in the example above.
So you can use a few placeholders to modify your logmessage or, if a placeholder is missing you can create your own.
```typescript
let conf: LogUpTsOptions = {
    quiet: true,
    prefix: '',
    placeholders: [
        {
            keys: ['<a>', '</a>'],
            replacer: ( abs?: string, passArg?: any ) => {
                return '<link>' + abs;
            },
            flags: 'g',
        },
        {
            keys: ['<maintainer />'],
            flags: 'g',
            replacer: () => {
                return 'milleniumfrog';
            }
        }
    ],
};
let logger: LogUpTs = new LogUpTs( conf, {} );
let str: string = await logger.log( '<a>hello <maintainer /></a>' );
expect( str ).to.eql( '<link>hello milleniumfrog' );
```
the following placeholders already exist:

- {{date}}
- {{day}}
- {{month}}
- {{year}}
- {{hours}}
- {{minutes}}
- {{seconds}}
- {{service}} (returns the value of passArguments.service, normally something like [LOG], [ERROR], [WARN])

## Transports - File Transport


A transport is an object that matches to the following interface:
```typescript
interface Transport {
    exec: ( transportOptions: any, str: string ) => Promise<void>;
}
```
The transportOptions are the internals of the logupts-instance.

LogUpTs gets shipped with a file-transport (for linux and mac, windows support will follow)
### Usage
```typescript
let options: LogUpTsOptions = {
    transports: [ new FileTransport( 'test1.log', '../log', [ 'ALL' ] ) ],
    quiet: true,
}
let internals: any & FileInternals = {
}
let logger: LogUpTs = new LogUpTs( options, internals );
logger.log( 'begin file' );
for ( let i = 0; i < 100; i++ ) {
    logger.log( i+2 + 'Zeile' );
}
logger.log( 'end file' );
```

## Extend LogUpTs
add new functions:
```typescript
let logger: LogUpTs | (LogUpTs & { info: ( str: string ) => Promise<string> })= new LogUpTs(  );
let info: ( str: string ) => Promise<string> = async ( str: string) => {
    logger.options.logType = "INFO";
    logger.internals.service = "INFO";
    return logger.custom( logger.options, logger.internals, str );
}
info( "hello" ) ) // "[INFO] hello"
```
add the new function to a logupts class
```typescript
class eLogUpTs extends LogUpTs {
    constructor() {
        super( {quiet: true} );
    }
    info( msg: string ) {
        this.options.logType = 'LOG';
        this.internals.service = 'INFO'
        return super.custom(this.options, this.internals, "hello");
    }
}
let logger= new eLogUpTs();
logger.info( "hello" ) // "[INFO] hello"
```

### LICENSE MIT
### MAINTAINER: milleniumfrog