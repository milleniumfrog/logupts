import { LogUpTs } from './logupts';
import * as fs from 'fs';
import * as path from 'path';
export class LogUpTsTransportFile {
    constructor(path, fileName, loguptsObject, toPrint) {
        this._key = `FILE:${path}`;
        this.toPrint = toPrint;
        this.path = path;
        this.fileName = fileName;
        this.loguptsObject = loguptsObject;
        this.generateDir(path);
    }
    get key() {
        return this._key;
    }
    exec(internal, str) {
        let print = false;
        for (let i of this.toPrint) {
            if ((internal.groups || []).indexOf(i) >= 0) {
                print = true;
                break;
            }
        }
        if (print) {
            LTFQ.add(this.key, (() => { return this.writeToFs(this.path, this.fileName, str); }));
        }
        return Promise.resolve();
    }
    writeToFs(absolutePath, fileName, message) {
        return new Promise((resolve, reject) => {
            fileName = LogUpTs.generateString(this.loguptsObject, fileName);
            let filePath = `${absolutePath}/${fileName}`;
            fs.writeFile(filePath, message + '\n', { flag: 'a' }, (error) => {
                if (error)
                    reject(error);
                resolve();
            });
        });
    }
    generateDir(toGenPath) {
        let pathSegments = toGenPath.split(path.sep);
        let pathToCheck = '';
        for (let pathSegment of pathSegments) {
            if (pathSegment === '/' || pathSegment === '')
                continue;
            pathToCheck += '/' + pathSegment;
            if (!fs.existsSync(pathToCheck)) {
                fs.mkdirSync(pathToCheck);
            }
        }
    }
}
export var LTFQ;
(function (LTFQ) {
    function add(key, fnType) {
        let que = LTFQ.ques.get(key) || [];
        que.push(fnType);
        LTFQ.ques.set(key, que);
        if (LTFQ.queFlags.get(key) || LTFQ.queFlags.get(key) === undefined) {
            LTFQ.run(key);
        }
    }
    LTFQ.add = add;
    function run(key) {
        LTFQ.queFlags.set(key, false);
        let que = LTFQ.ques.get(key) || [];
        if (que.length === 0) {
            LTFQ.queFlags.set(key, true);
            return Promise.resolve();
        }
        let fn = que.shift() || (() => { return Promise.resolve(); });
        return fn()
            .then(() => {
            LTFQ.run(key);
        });
    }
    LTFQ.run = run;
    LTFQ.ques = new Map();
    LTFQ.queFlags = new Map();
})(LTFQ || (LTFQ = {}));
//# sourceMappingURL=logupts-transport-file.js.map