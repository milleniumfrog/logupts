import { Placeholder, fillStrWithZeros } from './placeholder';
import * as chai from 'chai';

describe( 'Placeholders', () => {
    it( 'fillStrWithZeros', () => {
        let str = fillStrWithZeros(4, '1');
        chai.expect( str ).to.eql( '0001' );
    });
});