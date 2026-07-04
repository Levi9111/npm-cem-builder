/**
 * src/ui.ts
 *
 * All terminal output for @cem/builder.
 * Zero external dependencies — pure Node.js ANSI escape codes.
 * Ported to TypeScript.
 */

// ─── ANSI PRIMITIVES ─────────────────────────────────────────────────────────
const ESC = '\x1b[';
const R   = '\x1b[0m'; // reset

const CODES = {
  bold:          `${ESC}1m`,
  dim:           `${ESC}2m`,
  cyan:          `${ESC}36m`,
  green:         `${ESC}32m`,
  yellow:        `${ESC}33m`,
  magenta:       `${ESC}35m`,
  gray:          `${ESC}90m`,
  white:         `${ESC}37m`,
  brightCyan:    `${ESC}96m`,
  brightGreen:   `${ESC}92m`,
  brightYellow:  `${ESC}93m`,
  brightMagenta: `${ESC}95m`,
  brightWhite:   `${ESC}97m`,
  bgCyan:        `${ESC}46m`,
};

// Check if the terminal supports color (respects NO_COLOR and non-TTY pipes)
const NO_COLOR = !process.stdout.isTTY || !!process.env.NO_COLOR;
const paint = (code: string, str: string) => NO_COLOR ? str : `${code}${str}${R}`;

export const bold    = (s: string) => paint(CODES.bold,          s);
export const dim     = (s: string) => paint(CODES.dim,           s);
export const cyan    = (s: string) => paint(CODES.brightCyan,    s);
export const green   = (s: string) => paint(CODES.brightGreen,   s);
export const yellow  = (s: string) => paint(CODES.brightYellow,  s);
export const gray    = (s: string) => paint(CODES.gray,          s);
export const white   = (s: string) => paint(CODES.brightWhite,   s);
export const magenta = (s: string) => paint(CODES.brightMagenta, s);

// Strip ANSI codes — used to compute visible string length for box padding
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');
const visLen    = (s: string) => stripAnsi(s).length;

// ─── BADGE ───────────────────────────────────────────────────────────────────
export const badge = (text: string) =>
  NO_COLOR
    ? `[${text}]`
    : `${CODES.bgCyan}${CODES.bold}${CODES.white} ${text} ${R}`;

// ─── BANNER ───────────────────────────────────────────────────────────────────
export function printBanner(version = '') {
  const line = gray('─'.repeat(52));
  const ver  = version ? gray(`v${version}`) : '';
  console.log();
  console.log(line);
  console.log();
  console.log(`  ${badge('CEM')}  ${bold(cyan('create-express-modular'))}  ${ver}`);
  console.log();
  console.log(`  ${gray('Modular Express + TypeScript — production-ready')}`);
  console.log();
  console.log(line);
  console.log();
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
export function sectionHeader(label: string) {
  console.log();
  console.log(`  ${gray('┄'.repeat(46))}`);
  console.log(`  ${bold(gray(label))}`);
  console.log(`  ${gray('┄'.repeat(46))}`);
  console.log();
}

// ─── STEP / LOG PRIMITIVES ───────────────────────────────────────────────────
/** Key–value config line:  ◆  Label    value  */
export function step(label: string, value = '') {
  const val = value ? `  ${gray(value)}` : '';
  console.log(`  ${cyan('◆')}  ${white(label)}${val}`);
}

/** Indented file/detail line  ·  path  */
export function substep(label: string) {
  console.log(`     ${gray('·')}  ${gray(label)}`);
}

/** ✔  Success message */
export function success(label: string) {
  console.log(`  ${green('✔')}  ${label}`);
}

/** ⚠  Warning message */
export function warn(label: string) {
  console.log(`  ${yellow('⚠')}  ${yellow(label)}`);
}

/** ✖  Error message */
export function err(label: string) {
  console.log(`  ${magenta('✖')}  ${magenta(label)}`);
}

/** Blank line shorthand */
export const nl = () => console.log();

// ─── SPINNER ─────────────────────────────────────────────────────────────────
export interface Spinner {
  succeed: (msg: string) => void;
  fail: (msg: string) => void;
}

/**
 * Wraps a sync operation with a spinner.
 */
export function spinner(label: string): Spinner {
  if (NO_COLOR || !process.stdout.isTTY) {
    // Non-TTY fallback — just print the label, no animation
    process.stdout.write(`  … ${label}\n`);
    return {
      succeed: (msg: string) => success(msg),
      fail:    (msg: string) => err(msg),
    };
  }

  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const pad = ' '.repeat(label.length + 12);

  const id = setInterval(() => {
    process.stdout.write(
      `\r  ${CODES.brightCyan}${frames[i++ % frames.length]}${R}  ${gray(label)}   `,
    );
  }, 80);

  const stop = () => {
    clearInterval(id);
    process.stdout.write(`\r${pad}\r`);
  };

  return {
    succeed(msg: string) { stop(); success(msg); },
    fail(msg: string)    { stop(); err(msg);     },
  };
}

// ─── SUMMARY BOX ─────────────────────────────────────────────────────────────
interface SummaryOpts {
  name: string;
  db: string;
  validator: string;
  auth: boolean;
  docker: boolean;
}

export function printSummary({ name, db, validator, auth, docker }: SummaryOpts) {
  const W = 48; // inner width (between the │ borders)

  const border = (l: string, m: string, r: string) =>
    `  ${gray(l + '─'.repeat(W) + r)}`;

  const blankRow = () =>
    `  ${gray('│')}${' '.repeat(W)}${gray('│')}`;

  const dataRow = (label: string, value: string, colorFn: (s: string) => string = cyan) => {
    const labelStr = gray(label.padEnd(14));
    const valueStr = colorFn(value);
    const pad = ' '.repeat(Math.max(0, W - 16 - visLen(value)));
    return `  ${gray('│')}  ${labelStr}${valueStr}${pad}  ${gray('│')}`;
  };

  console.log();
  console.log(border('╭', '─', '╮'));
  console.log(blankRow());
  // Title row — manually padded
  const title = bold(cyan('Project ready!'));
  const titlePad = ' '.repeat(W - 2 - visLen('Project ready!'));
  console.log(`  ${gray('│')}  ${title}${titlePad}${gray('│')}`);
  console.log(blankRow());
  console.log(border('├', '─', '┤'));
  console.log(blankRow());
  console.log(dataRow('Name',      name,                  white));
  console.log(dataRow('Database',  db,                    cyan));
  console.log(dataRow('Validator', validator,              magenta));
  console.log(dataRow('Auth',      auth   ? 'yes' : 'no', auth   ? green : gray));
  console.log(dataRow('Docker',    docker ? 'yes' : 'no', docker ? green : gray));
  console.log(blankRow());
  console.log(border('╰', '─', '╯'));
  console.log();
}

// ─── NEXT STEPS ──────────────────────────────────────────────────────────────
export function printNextSteps(projectName: string) {
  console.log(`  ${bold('Next steps')}`);
  console.log();
  console.log(`  ${gray('1.')}  ${cyan('cd')} ${white(projectName)}`);
  console.log(`  ${gray('2.')}  ${cyan('cem')} ${white('dev')}`);
  console.log(`  ${gray('3.')}  ${cyan('cem add module')} ${white('Product')}`);
  console.log(`  ${gray('4.')}  ${cyan('cem build')}`);
  console.log(`  ${gray('5.')}  ${cyan('cem start')}`);
  console.log();
  console.log(
    `  ${gray('Docs →')}  ${gray('https://github.com/Levi9111/npm-create-express-modular')}`,
  );
  console.log();
}

// ─── UPDATE NOTICE ───────────────────────────────────────────────────────────
export function printUpdateNotice(current: string, latest: string, pm = 'npm') {
  const W = 52;
  const border = (l: string, m: string, r: string) => `  ${yellow(l + '─'.repeat(W) + r)}`;
  const blankRow = () => `  ${yellow('│')}${' '.repeat(W)}${yellow('│')}`;

  console.log();
  console.log(border('╭', '─', '╮'));
  console.log(blankRow());
  
  const title = `Update available! ${dim(current)} → ${green(latest)}`;
  const pad1 = ' '.repeat(Math.max(0, W - visLen(title) - 4));
  console.log(`  ${yellow('│')}    ${title}${pad1}${yellow('│')}`);
  
  console.log(blankRow());
  
  const globalCmd = ({ npm: 'npm i -g', yarn: 'yarn global add', pnpm: 'pnpm add -g' } as Record<string, string>)[pm] || 'npm i -g';
  const cmd = `Run ${cyan(`${globalCmd} create-express-modular`)} to update`;
  const pad2 = ' '.repeat(Math.max(0, W - visLen(cmd) - 4));
  console.log(`  ${yellow('│')}    ${cmd}${pad2}${yellow('│')}`);
  
  console.log(blankRow());
  console.log(border('╰', '─', '╯'));
  console.log();
}

// ─── MODULE GENERATOR OUTPUT ─────────────────────────────────────────────────
export function printModuleBanner() {
  console.log();
  console.log(`  ${cyan('◆')}  ${bold(white('CEM'))}  ${gray('module generator')}`);
  console.log();
}

export function printModuleSuccess(moduleName: string, routePath: string, validator: string, extras: string[] = []) {
  console.log();
  success(`Module ${bold(cyan(moduleName))} created`);
  console.log();
  substep(`src/app/modules/${moduleName}/`);
  substep(`  ${gray('→')} controller, service, route, model, interface, validation`);
  extras.forEach((f) => substep(`  ${gray('→')} ${f}`));
  console.log();
  console.log(`  ${gray('Route:')}      ${cyan(routePath)}`);
  console.log(`  ${gray('Validator:')}  ${magenta(validator)}`);
  console.log();
}

// ─── ERROR / ABORT ────────────────────────────────────────────────────────────
export function abort(message: string): never {
  console.log();
  err(message);
  console.log();
  process.exit(1);
}
