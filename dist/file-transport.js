var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import fs from 'fs';
import path from 'path';
import { DefaultPlaceholders, replacePlaceholder } from './placeholder';
var FileTransport = (function () {
    function FileTransport(filename, filepath, printGroups, placeholders) {
        this.filename = filename;
        this.path = path.isAbsolute(filepath) ? filepath : path.resolve(__dirname, filepath);
        this.toPrint = printGroups;
        this.placeholders = placeholders || DefaultPlaceholders;
        this._que = [];
        this._running = false;
        var pathSegments = this.path.split(path.sep);
        var pathToCheck = '';
        for (var _i = 0, pathSegments_1 = pathSegments; _i < pathSegments_1.length; _i++) {
            var pathSegment = pathSegments_1[_i];
            if (pathSegment === '/' || pathSegment === '')
                continue;
            pathToCheck += "/" + pathSegment;
            if (!fs.existsSync(pathToCheck))
                fs.mkdirSync(pathToCheck);
        }
    }
    FileTransport.prototype.exec = function (internalOptions, modifiedStr, orginalStr) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (internalOptions.service === undefined)
                            throw new Error('interrnal Options file are not set');
                        if (this.toPrint.indexOf('ALL') >= 0 || this.toPrint.indexOf(internalOptions.service) >= 0)
                            this._que.push([internalOptions, modifiedStr]);
                        if (!!this._running) return [3, 2];
                        return [4, this._run()];
                    case 1:
                        _a.sent();
                        return [3, 3];
                    case 2:
                        this._running = true;
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    FileTransport.prototype._run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this._que.length > 0)) return [3, 2];
                        data = this._que.shift() || [undefined, 'null'];
                        return [4, this._writeToFS(data[0], data[1])];
                    case 1:
                        _a.sent();
                        return [3, 0];
                    case 2:
                        this._running = false;
                        return [2];
                }
            });
        });
    };
    FileTransport.prototype._writeToFS = function (internals, str) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var filename = replacePlaceholder(_this.placeholders, _this.filename, internals);
            var filePath = _this.path + "/" + filename;
            fs.writeFile(filePath, str + '\n', { flag: 'a' }, function (error) {
                if (error)
                    reject(error);
                resolve();
            });
        });
    };
    return FileTransport;
}());
export { FileTransport };
//# sourceMappingURL=file-transport.js.map