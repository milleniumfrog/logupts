export function replaceSingle( key: string, string: string, replaceContent: any, flags?: string): string 
{
	// set default flags
	flags = flags || 'g';
	// create Regex
	let regex = new RegExp( key, flags );
	let res: RegExpExecArray | null;
	let counter: number = 0;
	while( (res = regex.exec( string.slice( counter ) )) !== null )
	{
		string = string.replace( key, typeof replaceContent === 'function' ? replaceContent() : replaceContent );
		++counter;
	}
	return string;
};

export interface ComplexKey {
	keys: Array<string>;
	replacer: ( args: any ) => string;
	flags: string;
	/** for more perfomance with single key placeholders */
	called?: boolean;
}


export function replaceComplex ( complexKeys: Array<ComplexKey>, string: string) : string
{
	for ( let complex of complexKeys )
	{
		// single key placeholders
		if ( complex.keys[1] === undefined )
		{
			string = complex.called !== true ? replaceSingle( complex.keys[0], string, complex.replacer, complex.flags ) : string;
			complex.called = true;
		}
		// 2 key placeholders
		else
		{
			let maxIndex = -1;
			for ( let inComplex of complexKeys ) 
			{
				// create Regular expression
				let regex: RegExp = new RegExp( inComplex.keys[0], inComplex.flags );
				let res: RegExpExecArray | null = regex.exec( string );
				if ( res !== null ) {
					maxIndex = maxIndex < res.index ? res.index : maxIndex;
				}
			}
			if ( maxIndex > 0 )
			{
				string = string.slice(0, maxIndex) + replaceComplex( complexKeys, string.slice( maxIndex ) );
			}
			// search index where pattern is first time
			let regex: RegExp = new RegExp( complex.keys[0], complex.flags );
			let res1: RegExpExecArray | null = regex.exec( string );
			if ( res1 !== null )
			{
				// find closing pattern in string
				regex = new RegExp( complex.keys[1], complex.flags );
				let res2 = regex.exec( string );
				let removeEscapesFromKeys: string[] = [ complex.keys[0].replace( (new RegExp( '\\\\', 'g')), '' ), complex.keys[1].replace( (new RegExp( '\\\\', 'g')), '' )]
				if ( res2 !== null )
				{
					// create new string
					string = string.slice( 0, res1.index ) + complex.replacer( string.slice( res1.index + removeEscapesFromKeys[0].length , res2.index ) ) + string.slice( res2.index + removeEscapesFromKeys[1].length);
				}
			}
		}
	}
	return string;
}