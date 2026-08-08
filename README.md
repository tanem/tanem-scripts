# tanem-scripts

> **Deprecated.** Use [`tanem/release-action`](https://github.com/tanem/release-action) instead.

This package automated label-driven releases for my open-source repos: it
derived a semver bump from the labels on the week's merged pull requests,
versioned and tagged the repo, regenerated CHANGELOG.md, and published to npm.

That job now belongs to
[`tanem/release-action`](https://github.com/tanem/release-action), a composite
GitHub Action doing the same work with no npm dependency to install and no
personal access token to hold. Release notes there are published to GitHub
Releases rather than a regenerated CHANGELOG.md, and the `authors` command has
no successor — it was dropped rather than ported.

Every repo that used this package is off it, and nothing is released from here
any more: the weekly release cron is gone, so no release can fire.
[CHANGELOG.md](CHANGELOG.md) is frozen at v8.0.8, and this repo's history stays
readable.

## License

MIT
