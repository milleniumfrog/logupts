export { replaceComplex as replacePlaceholder } from 'strplace';
export var DefaultPlaceholders = [
    {
        keys: ['{{date}}'],
        replacer: function () {
            return "" + fillStrWithZeros(2, String((new Date()).getDate()));
        },
        flags: 'g'
    },
    {
        keys: ['{{day}}'],
        replacer: function () {
            return "" + fillStrWithZeros(2, String((new Date()).getDay()));
        },
        flags: 'g'
    },
    {
        keys: ['{{month}}'],
        replacer: function () {
            return "" + fillStrWithZeros(2, String((new Date()).getMonth() + 1));
        },
        flags: 'g'
    },
    {
        keys: ['{{year}}'],
        replacer: function () {
            return "" + (new Date()).getFullYear();
        },
        flags: 'g'
    },
    {
        keys: ['{{hours}}'],
        replacer: function () {
            return "" + fillStrWithZeros(2, String((new Date()).getHours()));
        },
        flags: 'g'
    },
    {
        keys: ['{{minutes}}'],
        replacer: function () {
            return "" + fillStrWithZeros(2, String((new Date()).getMinutes()));
        },
        flags: 'g'
    },
    {
        keys: ['{{seconds}}'],
        replacer: function () {
            return "" + fillStrWithZeros(2, String((new Date()).getSeconds()));
        },
        flags: 'g'
    },
    {
        keys: ['{{service}}'],
        replacer: function (none, passArguments) {
            return "[" + (passArguments.service || 'DEFAULT') + "]";
        },
        flags: 'g'
    },
];
export function fillStrWithZeros(length, msg) {
    if (length < msg.length) {
        throw new Error('the message is longer than the wished length.');
    }
    else {
        for (var i = msg.length; i < length; ++i) {
            msg = '0' + msg;
        }
    }
    return msg;
}
//# sourceMappingURL=placeholder.js.map