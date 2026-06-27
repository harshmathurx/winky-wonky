# Release Checklist — npm publish

## Before publishing

1. **Verify npm login**
   ```bash
   npm whoami
   ```
   If not logged in:
   ```bash
   npm login
   ```

2. **Build the lib bundle**
   ```bash
   npm run build:lib
   ```
   This outputs:
   - `dist/winky-wonky.min.js` (IIFE, 67KB)
   - `dist/winky-wonky.css` (56KB)
   - `dist/winky-wonky.es.js` (ES module, 81KB)

3. **Verify what will be published**
   ```bash
   npm pack --dry-run
   ```
   Should show 33 files: src/components/*, src/index.js, src/style.css, dist/winky-wonky.min.js, dist/winky-wonky.css, README.md, LICENSE, package.json

4. **Check package name is available**
   ```bash
   npm view winky-wonky
   ```
   Should return 404 (not yet published) or show your version if republishing.

## Publishing winky-wonky

5. **Publish**
   ```bash
   npm publish
   ```
   The `prepublishOnly` script will auto-run `build:lib` before publishing.

6. **Verify it's live**
   ```bash
   npm view winky-wonky
   ```
   Should show version 1.0.0.

7. **Verify CDN**
   - `https://unpkg.com/winky-wonky` should redirect to latest
   - `https://unpkg.com/winky-wonky/dist/winky-wonky.min.js` should serve the IIFE bundle
   - `https://unpkg.com/winky-wonky/dist/winky-wonky.css` should serve the CSS

## Publishing winky-wonky-react

8. **From the packages directory**
   ```bash
   cd packages/winky-wonky-react
   npm publish
   ```

9. **Verify**
   ```bash
   npm view winky-wonky-react
   ```

## Post-publish

10. **Tag the release**
    ```bash
    git tag -a v1.0.0 -m "v1.0.0 — physics-first UI library"
    git push origin v1.0.0
    ```

11. **Create GitHub Release**
    ```bash
    gh release create v1.0.0 --title "v1.0.0 — Physics-First UI Library" --notes-file CHANGELOG.md
    ```

12. **Update getting-started page**
    The CDN URLs in `examples/getting-started.html` use `unpkg.com/winky-wonky` which will resolve once published. No changes needed.

## Version bumping (for future releases)

```bash
# Patch (1.0.0 → 1.0.1)
npm version patch

# Minor (1.0.0 → 1.1.0)
npm version minor

# Major (1.0.0 → 2.0.0)
npm version major
```

Then repeat steps 5-11.
