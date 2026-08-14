# Contributing

## Setup

```bash
npm install
npm run storybook   # component gallery + docs, http://localhost:6006
npm run test:all    # vitest, every workspace package
```

## Repo layout

npm workspaces monorepo. The root package.json is private/unpublished
tooling only — the three published packages live under `packages/`:

- `winky-wonky` (`packages/winky-wonky`) — the 24 vanilla-JS components
- `@winkywonky/core` (`packages/winky-core`) — the headless physics/gesture/audio engine
- `winky-wonky-react` (`packages/winky-wonky-react`) — controlled React wrappers

Storybook (`.storybook/`, `stories/`) is dev-only tooling for browsing and
tuning components live; it is never published. See
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the deeper design notes.

## Making a change

1. Branch off `main`, make your change, add/update tests.
2. If your change affects the published behavior of `winky-wonky`,
   `@winkywonky/core`, or `winky-wonky-react`, add a changeset:

   ```bash
   npm run changeset
   ```

   Pick the affected package(s), the semver bump (patch/minor/major), and
   write a one-line summary — it becomes the CHANGELOG entry. Commit the
   generated `.changeset/*.md` file with your PR. Skip this for docs/CI/
   Storybook-only changes.
3. Open a PR. CI runs tests, the library build, and the Storybook build.

See [`docs/RELEASE-CHECKLIST.md`](docs/RELEASE-CHECKLIST.md) and
[`.changeset/README.md`](.changeset/README.md) for how merges turn into npm
releases.
