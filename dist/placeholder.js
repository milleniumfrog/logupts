export const DefaultPlaceholders = [
    // get day 1-31
    {
        keys: ['{{date}}'],
        replacer: () => {
            return `${fillStrWithZeros(2, String((new Date()).getDate()))}`;
        },
        flags: 'g'
    },
    {
        keys: ['{{day}}'],
        replacer: () => {
            return `${fillStrWithZeros(2, String((new Date()).getDay()))}`;
        },
        flags: 'g'
    },
    {
        keys: ['{{month}}'],
        replacer: () => {
            return `${fillStrWithZeros(2, String((new Date()).getMonth() + 1))}`;
        },
        flags: 'g'
    },
    {
        keys: ['{{year}}'],
        replacer: () => {
            return `${(new Date()).getFullYear()}`;
        },
        flags: 'g'
    },
    {
        keys: ['{{hours}}'],
        replacer: () => {
            return `${fillStrWithZeros(2, String((new Date()).getHours()))}`;
        },
        flags: 'g'
    },
    {
        keys: ['{{minutes}}'],
        replacer: () => {
            return `${fillStrWithZeros(2, String((new Date()).getMinutes()))}`;
        },
        flags: 'g'
    },
    {
        keys: ['{{seconds}}'],
        replacer: () => {
            return `${fillStrWithZeros(2, String((new Date()).getSeconds()))}`;
        },
        flags: 'g'
    },
    {
        keys: ['{{service}}'],
        replacer: (none, passArguments) => {
            return `[${passArguments.service || 'DEFAULT'}]`;
        },
        flags: 'g'
    },
];
/**
 * fill up a string with zeros
 * @param length
 * @param msg
 */
export function fillStrWithZeros(length, msg) {
    if (length < msg.length) {
        throw new Error('the message is longer than the wished length.');
    }
    else {
        for (let i = msg.length; i < length; ++i) {
            msg = '0' + msg;
        }
    }
    return msg;
}
