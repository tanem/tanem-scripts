import { execSync } from 'child_process';

const CLI_PATH = 'node dist/cli.js';

describe('CLI integration tests', () => {
  beforeAll(() => {
    if (!process.env.CHANGELOG_GITHUB_TOKEN) {
      throw new Error(
        'CHANGELOG_GITHUB_TOKEN environment variable is required for CLI tests',
      );
    }
  });

  test('authors command produces valid output', () => {
    const output = execSync(`${CLI_PATH} authors`, {
      encoding: 'utf-8',
      env: process.env,
    });

    // Should contain valid author entries
    expect(output).toMatch(/[\w\s<>@\[\].-]+/);
    expect(output.split('\n').length).toBeGreaterThan(0);

    // Should contain at least one email address
    expect(output).toMatch(/<[^>]+>/);
  });

  test('changelog command produces valid markdown', () => {
    const output = execSync(`${CLI_PATH} changelog`, {
      encoding: 'utf-8',
      env: process.env,
    });

    // Should have changelog structure
    expect(output).toContain('# Changelog');

    // Should contain version headers
    expect(output).toMatch(/## \[v\d+\.\d+\.\d+\]/);

    // Should contain PR links
    expect(output).toContain('https://github.com');
  });

  test('changelog command respects futureRelease option', () => {
    const output = execSync(`${CLI_PATH} changelog --future-release v99.0.0`, {
      encoding: 'utf-8',
      env: process.env,
    });

    expect(output).toContain('[v99.0.0]');
  });
});
