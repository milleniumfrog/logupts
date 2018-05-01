import { InternalLogUpTsOptions, Transport, LogUpTs }  from './logupts';
import * as fs from 'fs';
import * as path from 'path';

export class LogUpTsTransportFile implements Transport {
	private _key: string;
	public path: string;
	public fileName: string;
	public toPrint: Array<string>;
	public loguptsObject: LogUpTs;
	/**
	 * 
	 * @param path absolute Path
	 */
	constructor(path: string, fileName: string, loguptsObject: LogUpTs,  toPrint: Array<string>) {
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

	exec(internal: InternalLogUpTsOptions, str: string) {
		let print: boolean = false;
		for (let i of this.toPrint) {
			if ((internal.groups || []).indexOf(i) >= 0) {
				print = true;
				break;
			}
		}
		if (print) {
			LTFQ.add(this.key, (() => {return this.writeToFs(this.path, this.fileName, str)}))
		}
		return Promise.resolve();
	}

	writeToFs(absolutePath: string, fileName: string, message: string): Promise<void> {
		return new Promise((resolve, reject) => {
			fileName = LogUpTs.generateString(this.loguptsObject, fileName);
			let filePath = `${absolutePath}/${fileName}`;
			fs.writeFile(filePath, message + '\n', { flag: 'a' }, (error: any) => {
                if (error)
                    reject(error);
                resolve();
            })
		})
	}

	generateDir(toGenPath: string): void {
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
// que
export namespace LTFQ {
	export function add(key: string, fnType: () => Promise<void>): void{
		let que = LTFQ.ques.get(key) || [];
		que.push(fnType);
		LTFQ.ques.set(key, que);
		if (queFlags.get(key) || queFlags.get(key) === undefined){
			LTFQ.run(key);
		}
	}
	export function run(key: string): Promise<any> {
		LTFQ.queFlags.set(key, false);
		let que = LTFQ.ques.get(key) || [];
		if (que.length === 0) {
			queFlags.set(key, true);
			return Promise.resolve();
		}
		let fn = que.shift() || (()=>{return Promise.resolve()});
		return fn()
			.then(() => {
				LTFQ.run(key);
			});
	}
	export let ques: Map<string, Array<(() => Promise<any>)>> = new Map();
	export let queFlags: Map<string, boolean> = new Map();
}