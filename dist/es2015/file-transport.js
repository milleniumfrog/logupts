var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs';
import path from 'path';
import { DefaultPlaceholders, replacePlaceholder } from './placeholder';
export class FileTransport {
    constructor(filename, filepath, printGroups, placeholders) {
        this.filename = filename;
        this.path = path.isAbsolute(filepath) ? filepath : path.resolve(__dirname, filepath);
        this.toPrint = printGroups;
        this.placeholders = placeholders || DefaultPlaceholders;
        this._que = [];
        this._running = false;
        const pathSegments = this.path.split(path.sep);
        let pathToCheck = '';
        for (let pathSegment of pathSegments) {
            if (pathSegment === '/' || pathSegment === '')
                continue;
            pathToCheck += `/${pathSegment}`;
            if (!fs.existsSync(pathToCheck))
                fs.mkdirSync(pathToCheck);
        }
    }
    exec(internalOptions, str) {
        return __awaiter(this, void 0, void 0, function* () {
            if (internalOptions.service === undefined)
                throw new Error('interrnal Options file are not set');
            if (this.toPrint.indexOf('ALL') >= 0 || this.toPrint.indexOf(internalOptions.service) >= 0)
                this._que.push([internalOptions, str]);
            if (!this._running)
                yield this._run();
            else
                this._running = true;
        });
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
            let filename = replacePlaceholder(this.placeholders, this.filename, internals);
            let filePath = `${this.path}/${filename}`;
            fs.writeFile(filePath, str + '\n', { flag: 'a' }, (error) => {
                if (error)
                    reject(error);
                resolve();
            });
        });
    }
}
//# sourceMappingURL=file-transport.js.map