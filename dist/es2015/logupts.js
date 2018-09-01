var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DefaultPlaceholders, replacePlaceholder } from './placeholder';
export { DefaultPlaceholders, replacePlaceholder } from './placeholder';
export const defaultOptions = {
    prefix: '{{service}} ',
    postfix: '',
    placeholders: DefaultPlaceholders,
    quiet: false,
    transports: [],
    customFunctions: [],
    logType: 'log',
    logStack: true,
};
export class LogUpTs {
    constructor(customOptions, setInternals) {
        setInternals = setInternals || {};
        customOptions = customOptions || {};
        this.options = this.mergeOptions(customOptions, defaultOptions);
        this.internals = {
            service: 'LOG'
        };
        for (let key in setInternals) {
            this.internals[key] = setInternals[key];
        }
    }
    mergeOptions(customOptions, fillOptions) {
        fillOptions = fillOptions || this.options;
        return {
            prefix: customOptions.prefix !== undefined ? customOptions.prefix : fillOptions.prefix,
            postfix: customOptions.postfix !== undefined ? customOptions.postfix : fillOptions.postfix,
            placeholders: customOptions.placeholders !== undefined ? customOptions.placeholders : fillOptions.placeholders,
            quiet: customOptions.quiet !== undefined ? customOptions.quiet : fillOptions.quiet,
            transports: customOptions.transports !== undefined ? customOptions.transports : fillOptions.transports,
            customFunctions: customOptions.customFunctions !== undefined ? customOptions.customFunctions : fillOptions.customFunctions,
            logType: customOptions.logType !== undefined ? customOptions.logType : fillOptions.logType,
            logStack: customOptions.logStack !== undefined ? customOptions.logStack : fillOptions.logStack,
        };
    }
    custom(customOptions, setInternals, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let opt = this.mergeOptions(customOptions);
            for (let key in setInternals) {
                this.internals[key] = setInternals[key];
            }
            let str = `${opt.prefix}${message}${opt.postfix}`;
            str = replacePlaceholder((this.options.placeholders || []), str, this.internals);
            let asyncThings = [];
            for (let transport of opt.transports || []) {
                asyncThings.push(transport.exec(this.internals, str));
            }
            for (let asyncExec of opt.customFunctions || []) {
                asyncThings.push(asyncExec(str, this.internals, opt));
            }
            yield Promise.all(asyncThings);
            if (!opt.quiet && (console[opt.logType || 'log'] !== undefined)) {
                console[opt.logType || 'log'](str);
            }
            return str;
        });
    }
    ;
    log(str, customOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.custom(customOptions || {}, { service: 'LOG' }, str);
        });
    }
    error(error, customOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            let opt = this.mergeOptions(customOptions || {});
            opt.logType = 'error';
            let str = error instanceof Error ? `${error.message}${(opt.logStack && error.stack !== undefined) ? '\n' + error.stack : ''}` : error;
            return this.custom(opt, { service: 'ERROR' }, str);
        });
    }
    warn(message, customOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            let opt = this.mergeOptions(customOptions || {});
            opt.logType = 'warn';
            return this.custom(opt, { service: 'WARN' }, message);
        });
    }
}
//# sourceMappingURL=logupts.js.map