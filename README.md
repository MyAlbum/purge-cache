# purge-cache

This action allows the cache of GitHub Actions to be automatically purged

## Basic usage

See [action.yml](action.yml)

```yaml
steps:
# Do other steps like checkout, install, compile, etc.
- uses: MyAlbum/purge-cache@v2
  with:
    by-time: accessed # Purge caches by their last accessed time (default)
    max-age: 604800 # Leave caches accessed in the last 7 days (default)
```

## Example workflow

See [ci.yaml](.github/workflows/ci.yaml)

## Other options

### By

Each cache was `created` and then `accessed` at certain time.
Select by what time to purge caches.

```yaml
steps:
# Do other steps like checkout, install, compile, etc.
- uses: MyAlbum/purge-cache@v2
  with:
    by: created # Purge caches by their created time
```

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
