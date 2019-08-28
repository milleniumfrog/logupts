import { LOGLEVEL } from './loglevel';

export function logLevelMapper(logLevel: LOGLEVEL): 'info' | 'warn' | 'debug' | 'error' | 'trace' {
    switch(logLevel) {
        case LOGLEVEL.INFO:
            return 'info';
        case LOGLEVEL.WARN:
            return 'warn';
        case LOGLEVEL.DEBUG:
            return 'debug';
        case LOGLEVEL.TRACE:
            return 'trace';
        default:
            return 'error';
    }
}