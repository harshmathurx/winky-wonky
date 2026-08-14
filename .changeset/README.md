# Changesets

This monorepo uses [Changesets](https://github.com/changesets/changesets) to
version and publish `winky-wonky`, `@winky/core`, and `winky-wonky-react`
independently.

## Workflow

1. When your PR changes a published package, run `npm run changeset` and
   follow the prompts (which package(s), bump type, a short summary). Commit
   the generated `.changeset/*.md` file with your PR.
2. On merge to `main`, CI opens/updates a **"Version Packages"** PR that
   applies the pending changesets (bumps versions, updates CHANGELOGs).
3. Merging that PR triggers the actual `npm publish` — release only ever
   happens as a result of a version bump landing on `main`, never directly
   from a feature PR.

No changeset is needed for docs-only, CI-only, or Storybook-only changes
that don't affect a published package's behavior.
