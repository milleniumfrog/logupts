(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./logupts", "fs", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const logupts_1 = require("./logupts");
    const fs = require("fs");
    const path = require("path");
    class LogUpTsTransportFile {
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
                fileName = logupts_1.LogUpTs.generateString(this.loguptsObject, fileName);
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
    exports.LogUpTsTransportFile = LogUpTsTransportFile;
    var LTFQ;
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
    })(LTFQ = exports.LTFQ || (exports.LTFQ = {}));
});
//# sourceMappingURL=logupts-transport-file.js.map