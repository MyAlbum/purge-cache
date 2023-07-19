# purge-cache

This action allows the cache of GitHub Actions to be automatically purged

## Basic usage

See [action.yml](action.yml)

```yaml
steps:
# Do other steps like checkout, install, compile, etc.
- uses: MyAlbum/purge-cache@v2
  with:
    max-age: 604800 # Cache max 7 days since last use (this is the default)
```

## Example workflow

See [ci.yaml](.github/workflows/ci.yaml)

## Other options

### Debug

Output debug data (defaults to `false`)

- Number of caches
- Skipped caches
- Deleted caches

```yaml
steps:
# Do other steps like checkout, install, compile, etc.
- uses: MyAlbum/purge-cache@v2
  with:
    debug: true # Set to true to output debug info
```

### Token

Set a GitHub token, will default to `${github.token}`. This will probably not be nessesary as the default token should be sufficient

```yaml
steps:
# Do other steps like checkout, install, compile, etc.
- uses: MyAlbum/purge-cache@v2
  with:
    token: $GITHUBTOKEN # Set a GitHub token
```
