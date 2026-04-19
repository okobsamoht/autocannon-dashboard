# Contributing to Autocannon Dashboard

Thank you for your interest in contributing! This document covers everything you need to get started.

## Code of conduct

Be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

## Ways to contribute

- **Bug reports** — [open an issue](https://github.com/okobsamoht/autocannon-dashboard/issues/new?template=bug_report.md)
- **Feature requests** — [open an issue](https://github.com/okobsamoht/autocannon-dashboard/issues/new?template=feature_request.md)
- **Pull requests** — fix bugs, add features, improve docs

## Development setup

```bash
git clone https://github.com/okobsamoht/autocannon-dashboard.git
cd autocannon-dashboard
npm install
npm run dev
```

Requirements: Node.js ≥ 18, npm ≥ 9.

## Pull request process

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   # or
   git checkout -b fix/the-bug
   ```

2. **Make your changes.** Follow the conventions below.

3. **Test manually** — run `npm run dev` and verify the affected flows work.

4. **Build** — run `npm run build` and confirm it produces no errors.

5. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add HAR import for scenario generation
   fix: latency p99 showing 0 during live test
   docs: add environment variable reference
   refactor: extract chart helpers to separate module
   ```

6. **Push** and open a PR against `main`. Fill in the PR template.

## Conventions

### Code style
- Functional React components, hooks only — no class components
- No TypeScript for now — plain JS with JSDoc comments where useful
- Tailwind utility classes only — no inline styles, no CSS modules
- Keep components small and single-purpose

### IPC channels
Named `noun:verb` (e.g. `projects:list`, `test:run`). Main process handles via `ipcMain.handle`, renderer calls via `window.api.*` (exposed by preload).

### Data mutations
All persistence goes through the main process. The renderer never touches electron-store directly.

### Chart data
New metrics collected during a test must be added to the `dataPoint` object in `src/main/index.js` and consumed in `src/renderer/src/components/Charts.jsx`.

## What makes a good PR

- Focused — one logical change per PR
- Tested manually on the happy path and at least one edge case
- No unnecessary refactoring bundled in
- Screenshots / GIF in the PR description for UI changes
