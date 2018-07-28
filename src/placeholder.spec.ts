import { Placeholder, fillStrWithZeros } from './placeholder';

describe( 'Placeholders', () => {
    it( 'fillStrWithZeros', () => {
        let str = fillStrWithZeros(4, '1');
        expect( str ).toEqual( '0001' );
    });
});