# Copilot Instructions

## Verification

After making changes to dependencies or source code, always verify by running the relevant npm scripts before committing:

- `npm run check:types` — type checking
- `npm run lint` — linting
- `npm run build` — clean build
- `npm run test:src` — source tests
- `npm run test:cjs` — compiled output tests

Note: The CLI integration tests in `test/cli.test.ts` make real GitHub API calls and require `CHANGELOG_GITHUB_TOKEN` to be set. They are expected to take 2-3 minutes. For quick verification, running just the release tests (`--testPathPatterns release.test`) is sufficient.
