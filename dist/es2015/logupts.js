import { Placeholder, defaultPlaceholders } from './placeholders';
export { Placeholder, defaultPlaceholders };
export const DEBUG = true;
export class LogUpTs {
    constructor() {
        this.loguptsOptions = {
            praefix: '{{service}}',
            postfix: '',
            placeholders: defaultPlaceholders,
            quiet: false,
        };
    }
    generateString(string) {
        function countUp(param) {
            for (let i = 0; i < param.length; ++i) {
                if (param.substr(i, 3) === ')}}')
                    return i;
            }
            throw new Error('didnt close Placeholder');
        }
        string = string || '';
        let placeholders = this.loguptsOptions.placeholders || {};
        for (let propName in placeholders) {
            let regexDefault = new RegExp(`{{${placeholders[propName].key}}}`, 'gi');
        }
        return string;
    }
    internal(loguptsOptions, ...messages) {
        return messages[0];
    }
}
//# sourceMappingURL=logupts.js.map