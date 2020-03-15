# OpenPGP-action
![Test this action](https://github.com/oplik0/openPGP-action/workflows/Test%20this%20action/badge.svg)

Github action for encrypting or signing text

Example use would be encrypting debug data sent to some email, or signing a result of other action to make its origin (the repository) verifiable.

Uses OpenPGP.js for all PGP operations

## Inputs

### `text`

**Required** The text or path to file to encrypt/sign.

### `keysource`

**Required, defaults to `key`** decides whether key or keyserver query should be used. Change to `keyserver` to use the latter.

### `key`

**Required** the PGP key or (if `keysource` is set to `keyserver`) keyserver query used in the process. If a private key is provided, the message will be signed insted of being encrypted

### `privateKey`

**Optional**, used only if public key is provided. Key used to sign the encrypted message.

### passphrase

**Optional** used to decrypt the private key (either provided in `key` or in `privateKey`)

### keyserver

**Optional**, used only if `keysource` is set to `keyserver`. Custon url for a PGP keyserver. Default is https://keyserver.ubuntu.com

## Outputs

### `encrypted-text`

The result of encryption/signing

## Example usage

```
uses: oplik0/openpgp-action@v1
with:
    text: example
    key: ${{ secrets.PUBLIC_KEY }}
    privateKey: ${{ secrets.PRIVATE_KEY }}
    passphrase: ${{ secrets.PASSPHRASE }}
```
