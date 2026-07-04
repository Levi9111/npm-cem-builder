# @cem/builder

An elegant, fully-typed TypeScript compiler and architectural guard for **create-express-modular (CEM)** projects.

This package enforces structural and architectural conventions and compiles your TypeScript backend seamlessly.

## Features

- **Middleware Naming Guard**: Validates that all middleware files follow the `<name>.middleware.ts` naming convention.
- **Architecture Guard**:
  - Enforces that each module in `src/app/modules/` is not empty.
  - Ensures files follow the naming convention `<module-name>.<type>.ts`.
  - Verifies presence of the required module layers: `controller`, `service`, and `route`.
  - Performs orphan checks to verify if modules are registered in the main router (`src/app/routes/index.ts`).
- **TypeScript Compilation**: Invokes the local TypeScript compiler (`tsc`) within the target project root.

## Installation

```bash
npm install @cem/builder --save-dev
```

## Usage

### Programmatic API

You can import and run the builder or individual guards programmatically in your scripts:

```typescript
import { runBuild, runArchitectureGuard, runMiddlewareGuard } from '@cem/builder';

// Run the full build process (includes guards and compilation)
runBuild();

// Run guards individually
const projectRoot = process.cwd();
const archResult = runArchitectureGuard(projectRoot);
console.log('Architecture Errors:', archResult.hasError);

const mwResult = runMiddlewareGuard(projectRoot);
console.log('Middleware Errors:', mwResult.hasError);
```

## License

MIT
