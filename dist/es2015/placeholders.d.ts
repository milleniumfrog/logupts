import { LogUpTs } from 'logupts';
export declare class Placeholder {
    key: string;
    replaceVar: string | ((logObj: any, arrayStr?: string[]) => string);
    constructor(key: string, replaceVar: string | ((logObj: any, arrayStr?: string[]) => string));
    replace(logObjPlaceholderVars: LogUpTs, param: string): string;
}
export declare let defaultPlaceholders: {
    date: Placeholder;
    day: Placeholder;
    month: Placeholder;
    fullYear: Placeholder;
    year: Placeholder;
    hours: Placeholder;
    minutes: Placeholder;
    seconds: Placeholder;
    frog: Placeholder;
    service: Placeholder;
};
