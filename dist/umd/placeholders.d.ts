export declare class Placeholder {
    key: string;
    replacer: string;
    replacerFn: ((string: string | any) => string);
    constructor(key: string, replacerOrFn?: string | ((any: any) => string));
    static default: string;
    static defaultFn(param: string | object): string;
    static onlyString(param: any): void;
}
export declare let Placeholders: {
    [str: string]: Placeholder;
};
