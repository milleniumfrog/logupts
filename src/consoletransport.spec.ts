import process from 'process';
import chai from 'chai';
import { ConsoleTransport } from './consoletransport';
import { LogUpTsSync } from './loguptssync';
import { LOGLEVEL } from './loglevel';

function getConsoleOutput(callback: ()  => void) {
    const stdout_org = process.stdout._write;
    const stderr_org = process.stderr._write;
    let chunks: any[] = [];
    let chunksErr: any[] = [];
    // mute both streams and collect chunk data
    process.stdout._write = (chunk: any, encoding: string, cb: (err?: Error) => void) => {
        chunks.push(chunk);
        cb();
    }
    process.stderr._write = (chunk: any, encoding: string, cb: (err?: Error) => void) => {
        chunksErr.push(chunk);
        cb();
    }
    callback();
    // unmute both streams
    process.stdout._write = stdout_org;
    process.stderr._write = stderr_org;

    return { stdout: chunks, stderr: chunksErr }
}

describe('transport', () => {
    describe('console', () => {
        it('output normal message', () => {
            const demo = new LogUpTsSync({logLevel: LOGLEVEL.INFO});
            const output = getConsoleOutput(() => {
                demo.log('hello');
                demo.info('world');
            });
            chai.expect(output.stdout.join('')).to.eql('hello\nworld\n');
        });

        it('output normal message', () => {
            const demo = new LogUpTsSync({logLevel: LOGLEVEL.INFO});
            const output = getConsoleOutput(() => {
                demo.error('hello');
                demo.error(new Error('world'));
            });
            chai.expect(output.stderr.join('')).to.eql('hello\nworld\n');
        });
    })
})