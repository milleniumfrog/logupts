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
    replace(logObjPlaceholderVars: LogUpTs, param: string) {
        // returns a value if replaceVar is a string
        if (typeof this.replaceVar === 'string') {
            return this.replaceVar;
        }
        if (param.length === 0) {
            return this.replaceVar(logObjPlaceholderVars);
        } else {
            param = `[${param}]`;
            return this.replaceVar(logObjPlaceholderVars, JSON.parse(param));
        }
    }
}

export let defaultPlaceholders = {
    /** return the day of the month  1-31*/
    date: new Placeholder('date', `${fillStrWithZeros(2, String((new Date()).getDate()))}`),
    /** returns the day of the week 0-6 */
    day: new Placeholder('day', `${fillStrWithZeros(2, String((new Date()).getDay()))}`),
    /** returns the month 1-12 */
    month: new Placeholder('month', `${fillStrWithZeros(2, String((new Date()).getMonth()+1))}`),
    /** returns the year, ex. 2018 */
    fullYear: new Placeholder('fullYear', `${(new Date()).getFullYear()}`),
    /** @deprecated use fullYear instead */
    year: new Placeholder('year', `${(new Date()).getFullYear()}`),
    /** returns the hours */
    hours: new Placeholder('hours', `${fillStrWithZeros(2, String((new Date()).getHours()))}`),
    /** returns the minutes */
    minutes: new Placeholder('minutes', `${fillStrWithZeros(2, String((new Date()).getMinutes()))}`),
    /** returns the actual seconds*/
    seconds: new Placeholder('seconds', `${fillStrWithZeros(2, String((new Date()).getSeconds()))}`),
    /** returns all Contributers */
    frog: new Placeholder('frog', 'All Contributers: milleniumfrog'),
    /** returns the value of activeService */
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