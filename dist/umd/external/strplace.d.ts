export declare function replaceSingle(key: string, string: string, replaceContent: any, flags?: string, passArguments?: any): string;
export interface ComplexKey {
    keys: Array<string>;
    replacer: ((str?: string, passArguments?: any) => string);
    flags: string;
    /** for more perfomance with single key placeholders */
    called?: boolean;
}
export declare function replaceComplex(complexKeys: Array<ComplexKey>, string: string, passArguments?: any): string;
