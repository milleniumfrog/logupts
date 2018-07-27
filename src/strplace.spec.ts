import { replaceSingle, replaceComplex, ComplexKey } from './strplace';

describe('replaceSingle', () => {
	it('simple', () => {
		let str: string = '{{repl}} is replaced';
		expect(replaceSingle('{{repl}}', str, 'This')).toEqual('This is replaced');
		expect(replaceSingle('{{repl} }', str, 'This')).toEqual('{{repl}} is replaced');
	});
});

describe('replace Complex', () => {
	it( 'complex', () => {
		let str: string = '<str><hello/> <a>this is a referrer<a>this is a referrer</a></a></str>';
		let keys: ComplexKey[] = [
			{
				flags: 'g',
				keys: ['<hello/>'],
				replacer: (args: string) => { return 'hello' }
			},
			{
				flags: 'g',
				keys: ['<a>', '</a>'],
				replacer: (args: string) => { return `<l>${args}</l>` }
			}
		];
		expect( replaceComplex( keys, str )).toEqual( '<str>hello <l>this is a referrer<l>this is a referrer</l></l></str>' );
		str = '{{str(this is a text)}}';
		keys = [
			{
				flags: 'g',
				keys: ['\\{\\{str\\(', '\\)\\}\\}'],
				replacer: (args: string) => {return args}
			}
		]
		expect( replaceComplex( keys, str )).toEqual( 'this is a text' );
	})
});