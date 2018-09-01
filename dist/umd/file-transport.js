var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "path", "./placeholder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs_1 = __importDefault(require("fs"));
    const path_1 = __importDefault(require("path"));
    const placeholder_1 = require("./placeholder");
    class FileTransport {
        constructor(filename, filepath, printGroups, placeholders) {
            this.filename = filename;
            this.path = path_1.default.isAbsolute(filepath) ? filepath : path_1.default.resolve(__dirname, filepath);
            this.toPrint = printGroups;
            this.placeholders = placeholders || placeholder_1.DefaultPlaceholders;
            this._que = [];
            this._running = false;
            const pathSegments = this.path.split(path_1.default.sep);
            let pathToCheck = '';
            for (let pathSegment of pathSegments) {
                if (pathSegment === '/' || pathSegment === '')
                    continue;
                pathToCheck += `/${pathSegment}`;
                if (!fs_1.default.existsSync(pathToCheck))
                    fs_1.default.mkdirSync(pathToCheck);
            }
        }
        exec(internalOptions, str) {
            if (internalOptions.service === undefined)
                throw new Error('interrnal Options file are not set');
            if (this.toPrint.indexOf('ALL') >= 0 || this.toPrint.indexOf(internalOptions.service) >= 0)
                this._que.push([internalOptions, str]);
            if (!this._running)
                this._run();
            else
                this._running = true;
            return Promise.resolve();
        }
        _run() {
            return __awaiter(this, void 0, void 0, function* () {
                while (this._que.length > 0) {
                    const data = this._que.shift() || [undefined, 'null'];
                    yield this._writeToFS(data[0], data[1]);
                }
                this._running = false;
            });
        }
        _writeToFS(internals, str) {
            return new Promise((resolve, reject) => {
                let filename = placeholder_1.replacePlaceholder(this.placeholders, this.filename, internals);
                let filePath = `${this.path}/${filename}`;
                fs_1.default.writeFile(filePath, str + '\n', { flag: 'a' }, (error) => {
                    if (error)
                        reject(error);
                    resolve();
                });
            });
        }
    }
    exports.FileTransport = FileTransport;
});
//# sourceMappingURL=file-transport.js.map