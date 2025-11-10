# security policy

## supported versions
the versions marked with a `yes` have the latest patches and security fixes, and are recommended for use. the versions with a `no` are okay for use, but not recommended.

| version | supported          | explanation |
| ------- | ------------------ | ------------ |
| v1.0.0 (wisp)  | `yes` | wisp is a secure connection method |
| v1.0.0 (bare)   | `no` | bare is unencrypted and not recommended for use |

## reporting a vulnerability

to report a vulnerability, you can open an issue with a clear description of the vulnerability, and add the `security` tag to it.

## updating your version
#### on the site
refresh the page to load the latest version, or empty the cache and reload

#### on a local copy

```bash
git fetch https://github.com/tenclips/ethereal

pnpm i # use your package manager of choice
pnpm run build # build new files
```

#### on a fork
go to your fork's page and sync it with the upstream repo
