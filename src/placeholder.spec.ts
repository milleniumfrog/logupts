import { Placeholder, fillStrWithZeros } from './placeholder';
import { expect } from 'chai';

describe( 'Placeholders', () => {
    it( 'fillStrWithZeros', () => {
        let str = fillStrWithZeros(4, '1');
        expect( str ).to.eql( '0001' );
    });
});