import { LogUpTs } from 'logupts';
export class Placeholder {
    constructor(
        public key: string,
        public replaceVar: string | ((logObj: any, arrayStr?: string[]) => string)
    ) {
        // debugger logger !TODO
    }
    /**
     * 
     * @param logObj 
     * @param string 
     */
    replace(logObjPlaceholderVars: LogUpTs, string: string) {
        // returns a value if replaceVar is a string
        if (typeof this.replaceVar === 'string') {
            return this.replaceVar;
        }
        if (string.length === 0) {
            return this.replaceVar(logObjPlaceholderVars);
        } else {
            string = `[${string}]`;
            return this.replaceVar(logObjPlaceholderVars, JSON.parse(string));
        }
    }
}

export let defaultPlaceholders = {
    date: new Placeholder('date', `${fillStrWithZeros(2, String((new Date()).getDate()))}`),
    day: new Placeholder('day', `${fillStrWithZeros(2, String((new Date()).getDay()))}`),
    month: new Placeholder('month', `${fillStrWithZeros(2, String((new Date()).getMonth()+1))}`),
    fullYear: new Placeholder('fullYear', `${(new Date()).getFullYear()}`),
    /** @deprecated use fullYear instead */
    year: new Placeholder('year', `${(new Date()).getFullYear()}`),
    hours: new Placeholder('hours', `${fillStrWithZeros(2, String((new Date()).getHours()))}`),
    minutes: new Placeholder('minutes', `${fillStrWithZeros(2, String((new Date()).getMinutes()))}`),
    seconds: new Placeholder('seconds', `${fillStrWithZeros(2, String((new Date()).getSeconds()))}`),
    frog: new Placeholder('frog', 'milleniumfrog'),
    service: new Placeholder('service', ((placeholderVars: {[index: string]: string}) => {
        return `[${placeholderVars.activeService}]`;
    })),
}

/**
 * fill up a string with zeros
 * @param length 
 * @param msg 
 */
function fillStrWithZeros(length: number, msg: string) {
    if (length < msg.length) {
        throw new Error('the message is longer than the wished length.');
    } else {
        for (let i = msg.length; i < length; ++i) {
            msg = '0' + msg;
        }
    }
    return msg;
}