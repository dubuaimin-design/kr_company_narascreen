# Release checklist

Use this checklist before publishing a new npm version.

## Local checks

```bash
npm run check
npm run smoke
npm run pack:dry-run
```

## Metadata checks

- `package.json` has the intended `version`.
- `CHANGELOG.md` includes the new version.
- `README.md` examples still match the CLI.
- `npm pack --dry-run` only includes intended files.

## Publish

```bash
npm publish
```

For GitHub Actions based publishing, prefer npm Trusted Publishing/OIDC instead
of long-lived npm tokens.
