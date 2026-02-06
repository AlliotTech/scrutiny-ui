# Contributing

## Branching Model
We use **Trunk-Based Development**.

- `main` is the only long-lived branch.
- Work happens on short-lived branches: `feature/<short-description>`.
- All changes land via PR into `main`.
- `main` must stay releasable at all times.

## Workflow
1. Create a branch:
   ```bash
   git checkout -b feature/<short-description>
   ```
2. Commit small, focused changes.
3. Open a PR to `main`.
4. Ensure CI passes.
5. Merge quickly; avoid long-running branches.

## Releases
- Releases are created by **tagging** `main`:
  ```bash
  git tag vX.Y.Z
  git push origin vX.Y.Z
  ```
- Tags trigger the release workflow that builds the static bundle and uploads it to GitHub Releases.

## Pages Demo
- The demo site is deployed from `main` to GitHub Pages.
- It uses mock data for showcasing UI behavior.

## Guidelines
- Keep PRs small (prefer < 300 lines when possible).
- Prefer incremental changes over big-bang rewrites.
- Use feature flags when a change needs to land before it is fully ready.
