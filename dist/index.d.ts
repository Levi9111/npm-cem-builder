export interface GuardResult {
    hasError: boolean;
    warnCount: number;
}
export declare function runArchitectureGuard(projectRoot: string): GuardResult;
/**
 * Validates that every .ts file inside src/app/middlewares/ follows the
 * <name>.middleware.ts naming convention.
 * Core generated files are identified by their correct .middleware.ts names.
 * Any file ending in .ts but NOT in <name>.middleware.ts format is an error.
 */
export declare function runMiddlewareGuard(projectRoot: string): GuardResult;
export declare function runBuild(): void;
