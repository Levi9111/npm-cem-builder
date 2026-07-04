"use strict";
/**
 * src/ui.ts
 *
 * All terminal output for @cem/builder.
 * Zero external dependencies — pure Node.js ANSI escape codes.
 * Ported to TypeScript.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nl = exports.badge = exports.magenta = exports.white = exports.gray = exports.yellow = exports.green = exports.cyan = exports.dim = exports.bold = void 0;
exports.printBanner = printBanner;
exports.sectionHeader = sectionHeader;
exports.step = step;
exports.substep = substep;
exports.success = success;
exports.warn = warn;
exports.err = err;
exports.spinner = spinner;
exports.printSummary = printSummary;
exports.printNextSteps = printNextSteps;
exports.printUpdateNotice = printUpdateNotice;
exports.printModuleBanner = printModuleBanner;
exports.printModuleSuccess = printModuleSuccess;
exports.abort = abort;
// ─── ANSI PRIMITIVES ─────────────────────────────────────────────────────────
const ESC = '\x1b[';
const R = '\x1b[0m'; // reset
const CODES = {
    bold: `${ESC}1m`,
    dim: `${ESC}2m`,
    cyan: `${ESC}36m`,
    green: `${ESC}32m`,
    yellow: `${ESC}33m`,
    magenta: `${ESC}35m`,
    gray: `${ESC}90m`,
    white: `${ESC}37m`,
    brightCyan: `${ESC}96m`,
    brightGreen: `${ESC}92m`,
    brightYellow: `${ESC}93m`,
    brightMagenta: `${ESC}95m`,
    brightWhite: `${ESC}97m`,
    bgCyan: `${ESC}46m`,
};
// Check if the terminal supports color (respects NO_COLOR and non-TTY pipes)
const NO_COLOR = !process.stdout.isTTY || !!process.env.NO_COLOR;
const paint = (code, str) => NO_COLOR ? str : `${code}${str}${R}`;
const bold = (s) => paint(CODES.bold, s);
exports.bold = bold;
const dim = (s) => paint(CODES.dim, s);
exports.dim = dim;
const cyan = (s) => paint(CODES.brightCyan, s);
exports.cyan = cyan;
const green = (s) => paint(CODES.brightGreen, s);
exports.green = green;
const yellow = (s) => paint(CODES.brightYellow, s);
exports.yellow = yellow;
const gray = (s) => paint(CODES.gray, s);
exports.gray = gray;
const white = (s) => paint(CODES.brightWhite, s);
exports.white = white;
const magenta = (s) => paint(CODES.brightMagenta, s);
exports.magenta = magenta;
// Strip ANSI codes — used to compute visible string length for box padding
// eslint-disable-next-line no-control-regex
const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
const visLen = (s) => stripAnsi(s).length;
// ─── BADGE ───────────────────────────────────────────────────────────────────
const badge = (text) => NO_COLOR
    ? `[${text}]`
    : `${CODES.bgCyan}${CODES.bold}${CODES.white} ${text} ${R}`;
exports.badge = badge;
// ─── BANNER ───────────────────────────────────────────────────────────────────
function printBanner(version = '') {
    const line = (0, exports.gray)('─'.repeat(52));
    const ver = version ? (0, exports.gray)(`v${version}`) : '';
    console.log();
    console.log(line);
    console.log();
    console.log(`  ${(0, exports.badge)('CEM')}  ${(0, exports.bold)((0, exports.cyan)('create-express-modular'))}  ${ver}`);
    console.log();
    console.log(`  ${(0, exports.gray)('Modular Express + TypeScript — production-ready')}`);
    console.log();
    console.log(line);
    console.log();
}
// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function sectionHeader(label) {
    console.log();
    console.log(`  ${(0, exports.gray)('┄'.repeat(46))}`);
    console.log(`  ${(0, exports.bold)((0, exports.gray)(label))}`);
    console.log(`  ${(0, exports.gray)('┄'.repeat(46))}`);
    console.log();
}
// ─── STEP / LOG PRIMITIVES ───────────────────────────────────────────────────
/** Key–value config line:  ◆  Label    value  */
function step(label, value = '') {
    const val = value ? `  ${(0, exports.gray)(value)}` : '';
    console.log(`  ${(0, exports.cyan)('◆')}  ${(0, exports.white)(label)}${val}`);
}
/** Indented file/detail line  ·  path  */
function substep(label) {
    console.log(`     ${(0, exports.gray)('·')}  ${(0, exports.gray)(label)}`);
}
/** ✔  Success message */
function success(label) {
    console.log(`  ${(0, exports.green)('✔')}  ${label}`);
}
/** ⚠  Warning message */
function warn(label) {
    console.log(`  ${(0, exports.yellow)('⚠')}  ${(0, exports.yellow)(label)}`);
}
/** ✖  Error message */
function err(label) {
    console.log(`  ${(0, exports.magenta)('✖')}  ${(0, exports.magenta)(label)}`);
}
/** Blank line shorthand */
const nl = () => console.log();
exports.nl = nl;
/**
 * Wraps a sync operation with a spinner.
 */
function spinner(label) {
    if (NO_COLOR || !process.stdout.isTTY) {
        // Non-TTY fallback — just print the label, no animation
        process.stdout.write(`  … ${label}\n`);
        return {
            succeed: (msg) => success(msg),
            fail: (msg) => err(msg),
        };
    }
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const pad = ' '.repeat(label.length + 12);
    const id = setInterval(() => {
        process.stdout.write(`\r  ${CODES.brightCyan}${frames[i++ % frames.length]}${R}  ${(0, exports.gray)(label)}   `);
    }, 80);
    const stop = () => {
        clearInterval(id);
        process.stdout.write(`\r${pad}\r`);
    };
    return {
        succeed(msg) {
            stop();
            success(msg);
        },
        fail(msg) {
            stop();
            err(msg);
        },
    };
}
function printSummary({ name, db, validator, auth, docker, }) {
    const W = 48; // inner width (between the │ borders)
    const border = (l, m, r) => `  ${(0, exports.gray)(l + '─'.repeat(W) + r)}`;
    const blankRow = () => `  ${(0, exports.gray)('│')}${' '.repeat(W)}${(0, exports.gray)('│')}`;
    const dataRow = (label, value, colorFn = exports.cyan) => {
        const labelStr = (0, exports.gray)(label.padEnd(14));
        const valueStr = colorFn(value);
        const pad = ' '.repeat(Math.max(0, W - 16 - visLen(value)));
        return `  ${(0, exports.gray)('│')}  ${labelStr}${valueStr}${pad}  ${(0, exports.gray)('│')}`;
    };
    console.log();
    console.log(border('╭', '─', '╮'));
    console.log(blankRow());
    // Title row — manually padded
    const title = (0, exports.bold)((0, exports.cyan)('Project ready!'));
    const titlePad = ' '.repeat(W - 2 - visLen('Project ready!'));
    console.log(`  ${(0, exports.gray)('│')}  ${title}${titlePad}${(0, exports.gray)('│')}`);
    console.log(blankRow());
    console.log(border('├', '─', '┤'));
    console.log(blankRow());
    console.log(dataRow('Name', name, exports.white));
    console.log(dataRow('Database', db, exports.cyan));
    console.log(dataRow('Validator', validator, exports.magenta));
    console.log(dataRow('Auth', auth ? 'yes' : 'no', auth ? exports.green : exports.gray));
    console.log(dataRow('Docker', docker ? 'yes' : 'no', docker ? exports.green : exports.gray));
    console.log(blankRow());
    console.log(border('╰', '─', '╯'));
    console.log();
}
// ─── NEXT STEPS ──────────────────────────────────────────────────────────────
function printNextSteps(projectName) {
    console.log(`  ${(0, exports.bold)('Next steps')}`);
    console.log();
    console.log(`  ${(0, exports.gray)('1.')}  ${(0, exports.cyan)('cd')} ${(0, exports.white)(projectName)}`);
    console.log(`  ${(0, exports.gray)('2.')}  ${(0, exports.cyan)('cem')} ${(0, exports.white)('dev')}`);
    console.log(`  ${(0, exports.gray)('3.')}  ${(0, exports.cyan)('cem add module')} ${(0, exports.white)('Product')}`);
    console.log(`  ${(0, exports.gray)('4.')}  ${(0, exports.cyan)('cem build')}`);
    console.log(`  ${(0, exports.gray)('5.')}  ${(0, exports.cyan)('cem start')}`);
    console.log();
    console.log(`  ${(0, exports.gray)('Docs →')}  ${(0, exports.gray)('https://github.com/Levi9111/npm-create-express-modular')}`);
    console.log();
}
// ─── UPDATE NOTICE ───────────────────────────────────────────────────────────
function printUpdateNotice(current, latest, pm = 'npm') {
    const W = 52;
    const border = (l, m, r) => `  ${(0, exports.yellow)(l + '─'.repeat(W) + r)}`;
    const blankRow = () => `  ${(0, exports.yellow)('│')}${' '.repeat(W)}${(0, exports.yellow)('│')}`;
    console.log();
    console.log(border('╭', '─', '╮'));
    console.log(blankRow());
    const title = `Update available! ${(0, exports.dim)(current)} → ${(0, exports.green)(latest)}`;
    const pad1 = ' '.repeat(Math.max(0, W - visLen(title) - 4));
    console.log(`  ${(0, exports.yellow)('│')}    ${title}${pad1}${(0, exports.yellow)('│')}`);
    console.log(blankRow());
    const globalCmd = {
        npm: 'npm i -g',
        yarn: 'yarn global add',
        pnpm: 'pnpm add -g',
    }[pm] || 'npm i -g';
    const cmd = `Run ${(0, exports.cyan)(`${globalCmd} create-express-modular`)} to update`;
    const pad2 = ' '.repeat(Math.max(0, W - visLen(cmd) - 4));
    console.log(`  ${(0, exports.yellow)('│')}    ${cmd}${pad2}${(0, exports.yellow)('│')}`);
    console.log(blankRow());
    console.log(border('╰', '─', '╯'));
    console.log();
}
// ─── MODULE GENERATOR OUTPUT ─────────────────────────────────────────────────
function printModuleBanner() {
    console.log();
    console.log(`  ${(0, exports.cyan)('◆')}  ${(0, exports.bold)((0, exports.white)('CEM'))}  ${(0, exports.gray)('module generator')}`);
    console.log();
}
function printModuleSuccess(moduleName, routePath, validator, extras = []) {
    console.log();
    success(`Module ${(0, exports.bold)((0, exports.cyan)(moduleName))} created`);
    console.log();
    substep(`src/app/modules/${moduleName}/`);
    substep(`  ${(0, exports.gray)('→')} controller, service, route, model, interface, validation`);
    extras.forEach((f) => substep(`  ${(0, exports.gray)('→')} ${f}`));
    console.log();
    console.log(`  ${(0, exports.gray)('Route:')}      ${(0, exports.cyan)(routePath)}`);
    console.log(`  ${(0, exports.gray)('Validator:')}  ${(0, exports.magenta)(validator)}`);
    console.log();
}
// ─── ERROR / ABORT ────────────────────────────────────────────────────────────
function abort(message) {
    console.log();
    err(message);
    console.log();
    process.exit(1);
}
