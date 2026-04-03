# nextjs-cucumber-playwright-starter

A starter template for BDD testing [Next.js](https://nextjs.org/) apps with [Cucumber](https://cucumber.io/) + [Playwright](https://playwright.dev/), featuring built-in V8 code coverage.

## Highlights

- **Cucumber BDD** -- Write tests in plain English with Gherkin syntax, then automate with Playwright
- **V8 Code Coverage** -- Collect real browser coverage via `page.coverage.startJSCoverage()`, no instrumentation needed
- **Dev & CI Modes** -- Dev mode launches a visible browser with hot reload; CI mode runs a production build headlessly
- **Consistent Coverage** -- `entryFilter` / `sourceFilter` / `sourcePath` are pre-configured so dev and CI produce the same `src/` report paths
- **monocart-coverage-reports** -- Generates HTML, LCOV, V8, and console reports from raw V8 data with automatic source map resolution
- **Browser Reuse** -- Browser launches once per test run; each scenario gets a fresh `BrowserContext` for isolation without the startup cost

## Tech Stack

| Tool | Version | Role |
|------|---------|------|
| Next.js | 16 | App framework |
| Cucumber | 12 | BDD test runner |
| Playwright | 1.59 | Browser automation |
| monocart-coverage-reports | 2.x | Coverage reporting |
| tsx | 4.x | TypeScript loader for Cucumber |
| start-server-and-test | 2.x | Server lifecycle management |

## Project Structure

```
tests/cucumber/
  features/          # Gherkin .feature files
    home.feature
  step-definitions/  # Step implementations
    home.steps.ts
  support/           # Hooks & shared config
    hooks.ts         # Browser lifecycle, coverage collection, BASE_URL
```

## Getting Started

```bash
npm install
npx playwright install chromium
```

## Scripts

```bash
# Development -- headed browser, dev server with hot reload
npm run test:cucumber:dev

# CI -- headless, production build, coverage with source maps
npm run test:cucumber:ci

# Run cucumber only (requires a server already running on :3000)
npm run test:cucumber

# Clean stale reports
npm run test:cucumber:clean
```

## Coverage Reports

After a test run, reports are generated in `reports/coverage/`:

| Format | File | Usage |
|--------|------|-------|
| HTML | `index.html` | Open in browser for interactive exploration |
| LCOV | `lcov.info` | Upload to Codecov, Coveralls, etc. |
| Cobertura | `cobertura-coverage.xml` | CI integrations (GitLab, Azure DevOps, Jenkins) |
| V8 | `coverage-report.json` | Raw V8 data for custom processing |
| Console | (terminal output) | Quick summary in CI logs |

## How It Works

1. **BeforeAll** -- Launches Chromium (headed or headless based on `HEADED` env var)
2. **Before** (each scenario) -- Creates a new `BrowserContext` + `Page`, starts `page.coverage.startJSCoverage()`
3. **After** (each scenario) -- Stops coverage, feeds raw V8 data to monocart
4. **AfterAll** -- Closes browser, generates coverage reports

### Coverage Filtering

The starter pre-configures monocart filters to produce clean reports:

- **`entryFilter`** -- In dev: keeps `webpack-internal://` entries containing `src/`. In production: keeps hashed app chunks only
- **`sourceFilter`** -- Keeps files under `src/`, excludes `node_modules`
- **`sourcePath`** -- Strips the `_N_E/` prefix from production source map paths

This ensures both dev and CI modes report the same `src/app/List.tsx`, `src/app/page.tsx` paths.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | Base URL for navigation in steps |
| `HEADED` | `false` | Set to `true` to launch a visible browser |
| `COVERAGE` | `false` | Set to `true` to enable source maps and disable minification in production builds |

## License

MIT
