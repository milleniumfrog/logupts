import { expect } from 'chai';
import { LogUpTs, defaultOptions, LogUpTsOptions, LogUpTsTemplateTypeInterface, Transport } from './logupts';
import { DefaultPlaceholders } from './placeholder';

describe( 'class LogUpTs:', () => {

	it( 'run with default settings', async () => {
		const logger = new LogUpTs( { quiet: true } );
		expect( await logger.log( 'first' ) ).to.eql( '[LOG] first' );
		expect( await logger.error( 'second' ) ).to.eql( '[ERROR] second' );
		expect( (await logger.error( new Error( 'third' ) )).substr( 0, 13 ) ).to.eql( '[ERROR] third' );
		expect( await logger.custom( logger.options, logger.internals, 'fourth' ) ).to.eql( '[ERROR] fourth' );
		expect( await logger.warn( 'fifth' ) ).to.eql( '[WARN] fifth' );
		expect( logger.options.placeholders ).to.eql( DefaultPlaceholders );
		expect( JSON.stringify( logger.mergeOptions( logger.options ) ) ).to.eql( JSON.stringify( Object.assign( {}, defaultOptions, { quiet: true } ) ) );
	} );


	describe( 'run with custom options', () => {

		it( 'no placeholders', async () => {
			const customOptions: LogUpTsOptions = { quiet: true, placeholders: [] };
			const logger = new LogUpTs( customOptions );
			expect( await logger.log( 'first' ) ).to.eql( '{{service}} first' );
		} );

		it( 'logStack === false', async () => {
			const customOptions: LogUpTsOptions = { quiet: true, logStack: false };
			const logger = new LogUpTs( customOptions );
			expect( await logger.error( new Error( 'first' ) ) ).to.eql( '[ERROR] first' );
			expect( await logger.log( 'second' ) ).to.eql( '[LOG] second' );
		} );

		it( 'with postfix', async () => {
			const customOptions: LogUpTsOptions = { quiet: true, postfix: ' {{service}}' };
			const logger = new LogUpTs( customOptions );
			expect( await logger.log( 'first' ) ).to.eql( '[LOG] first [LOG]' );
		} );

		it( 'without prefix', async () => {
			const customOptions: LogUpTsOptions = { quiet: true, prefix: '' };
			const logger = new LogUpTs( customOptions );
			expect( await logger.log( 'first' ) ).to.eql( 'first' );
		} );

		it( 'with custom functions', async () => {
			let counter: number = 0;
			const customFunc = async (param: string, internals: LogUpTsTemplateTypeInterface, options: LogUpTsOptions<LogUpTsTemplateTypeInterface> ) => { ++counter };
			const customOptions: LogUpTsOptions = { quiet: true, customFunctions: [customFunc] };
			const logger = new LogUpTs( customOptions );
			await logger.log( 'first' );
			await logger.error( 'second' );
			expect( counter ).to.eql( 2 );
		} );

		it( 'with transport function', async () => {
			let counter: number = 0;
			const transportMock: Transport = { async exec( transportOptions: LogUpTsTemplateTypeInterface, str: string ) { ++counter} };
			const customOptions: LogUpTsOptions =  { quiet: true, transports: [transportMock]};
			const logger = new LogUpTs( customOptions );
			await logger.log( 'first' );
			await logger.error( 'second' );
			expect( counter ).to.eql( 2 );
		} )

	} );

	describe( 'extend logupts', () => {

		it( 'create custom function with logger.custom', async () => {
			const logger = new LogUpTs( { quiet: true } );
			const log = ( msg: string ) => logger.log( msg );
			const error = (msg: string ) => logger.error( msg );
			const page = ( msg: string ) => logger.custom( {},  {service: 'PAGE' }, msg );
			expect( await log( 'first' ) ).to.eql( '[LOG] first' );
			expect( await error( 'second' ) ).to.eql( '[ERROR] second' );
			expect( await page( 'third' ) ).to.eql( '[PAGE] third' );
		} );

		it( 'extend the class', async () => {
			class eLogUpTs extends LogUpTs {
				public functionCounter: number;
				constructor() {
					super( { quiet: true } );
					this.functionCounter = 0;
				}
				async page( msg: string ) {
					++this.functionCounter;
					return this.custom( this.options, Object.assign( this.internals, { service: 'PAGE' } ), msg );
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
		
	} );

} )