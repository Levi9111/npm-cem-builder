/**
 * src/ui.ts
 *
 * All terminal output for @cem/builder.
 * Zero external dependencies — pure Node.js ANSI escape codes.
 * Ported to TypeScript.
 */
export declare const bold: (s: string) => string;
export declare const dim: (s: string) => string;
export declare const cyan: (s: string) => string;
export declare const green: (s: string) => string;
export declare const yellow: (s: string) => string;
export declare const gray: (s: string) => string;
export declare const white: (s: string) => string;
export declare const magenta: (s: string) => string;
export declare const badge: (text: string) => string;
export declare function printBanner(version?: string): void;
export declare function sectionHeader(label: string): void;
/** Key–value config line:  ◆  Label    value  */
export declare function step(label: string, value?: string): void;
/** Indented file/detail line  ·  path  */
export declare function substep(label: string): void;
/** ✔  Success message */
export declare function success(label: string): void;
/** ⚠  Warning message */
export declare function warn(label: string): void;
/** ✖  Error message */
export declare function err(label: string): void;
/** Blank line shorthand */
export declare const nl: () => void;
export interface Spinner {
    succeed: (msg: string) => void;
    fail: (msg: string) => void;
}
/**
 * Wraps a sync operation with a spinner.
 */
export declare function spinner(label: string): Spinner;
interface SummaryOpts {
    name: string;
    db: string;
    validator: string;
    auth: boolean;
    docker: boolean;
}
export declare function printSummary({ name, db, validator, auth, docker }: SummaryOpts): void;
export declare function printNextSteps(projectName: string): void;
export declare function printUpdateNotice(current: string, latest: string, pm?: string): void;
export declare function printModuleBanner(): void;
export declare function printModuleSuccess(moduleName: string, routePath: string, validator: string, extras?: string[]): void;
export declare function abort(message: string): never;
export {};
