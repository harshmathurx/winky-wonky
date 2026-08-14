# Releasing

Releases are automated via [Changesets](https://github.com/changesets/changesets)
and GitHub Actions (`.github/workflows/release.yml`). There is no manual
`npm publish` step — publishing only ever happens as a side effect of a
version-bump PR landing on `main`.

## How it works

1. PRs that change published behavior include a changeset (`npm run
   changeset`) — see [`CONTRIBUTING.md`](../CONTRIBUTING.md).
2. On every push to `main`, the release workflow runs `changeset version`
   via [`changesets/action`](https://github.com/changesets/action). If
   there are unreleased changesets, it opens/updates a **"Version Packages"**
   PR that bumps the affected package(s)' `package.json` versions and
   CHANGELOGs — no publish happens yet.
3. Merging that "Version Packages" PR pushes to `main` again. This time
   there are no pending changesets, so the workflow runs `changeset publish`
   instead: it publishes every package whose `package.json` version is
   ahead of what's on npm, to the public npm registry, then tags the commit
   (`<package>@<version>`) and pushes the tags.

So: **feature PRs never publish.** Only a merged "Version Packages" PR
publishes, and only the packages it actually bumped.

## One-time setup (repo owner)

- Add an npm [automation
  token](https://docs.npmjs.com/creating-and-viewing-access-tokens) with
  publish rights on `winky-wonky`, `@winkywonky/core`, and `winky-wonky-react` as
  the `NPM_TOKEN` repository secret.
- `@winkywonky/core` publishes under the `@winkywonky` npm org
  (https://www.npmjs.com/org/winkywonky) — make sure the token's account is
  a member with publish access (`publishConfig.access: public` is already
  set, so no paid scope is required, just membership/ownership).
- No other secrets are needed; `GITHUB_TOKEN` is provided automatically by
  Actions.

## Manual/local dry run

```bash
npm run changeset        # add a changeset
npx changeset status     # see what would be released
npm run version          # apply pending changesets locally (bumps + CHANGELOGs)
npm pack --dry-run       # inspect a package's tarball contents
```

Don't run `npm run release` (`changeset publish`) locally — let CI do it,
so every release is tied to a reviewed, merged "Version Packages" PR.
