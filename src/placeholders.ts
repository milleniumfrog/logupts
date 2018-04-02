export class Placeholder {
    public replacer: string;
    /**
     * the replacerFn sould check the param for being a string or not
     */
    public replacerFn: ((string: string | any) => string);
    constructor (
        public key: string, 
        replacerOrFn: string | ((any: any) => string) = "")  {
            if (typeof replacerOrFn === 'string') {
                this.replacer = replacerOrFn;
                this.replacerFn = Placeholder.defaultFn;
            } else {
                this.replacerFn = replacerOrFn;
                this.replacer = Placeholder.default;
            }
    }

    ////////////////////////////////
    ////// default fn //////////////
    ////////////////////////////////
    static default = "this placeholder doesn´t supports no Function";
    static defaultFn (param: string | object) {
        return ("this placeholder doesn´t supports functions");
    }
    static onlyString(param: any) {
        if ((typeof param).toLowerCase() !== 'string')
            throw new Error("this placeholder doesn´t supports functions without a string as param");
    }

}

/**
 * contains following Placeholders
 * - String Placeholders
 *  - date
 *  - day
 *  - month
 *  - fullYear
 *  - hours
 *  - minutes
 *  - seconds
 *  - frog
 * - Function()
 *  - service
 * - Function(withParam)
 */
export let Placeholders: {[str: string]: Placeholder} = {
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