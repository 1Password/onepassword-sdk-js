[@1password/sdk](../README.md) / [Modules](../modules.md) / [secrets](../modules/secrets.md) / SecretsSource

# Class: SecretsSource

[secrets](../modules/secrets.md).SecretsSource

Exposes functionality for retrieving secrets.

## Implements

- [`SecretsApi`](../interfaces/secrets.SecretsApi.md)

## Methods

### resolve

▸ **resolve**(`secretReference`): `Promise`\<`string`\>

Takes as input a secret reference and returns the secret to which it points.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `secretReference` | `string` | A string containing a secret reference (string of the form "op://vault/item/field"). |

#### Returns

`Promise`\<`string`\>

The value of the referenced 1Password item field.

#### Implementation of

[SecretsApi](../interfaces/secrets.SecretsApi.md).[resolve](../interfaces/secrets.SecretsApi.md#resolve)

#### Defined in

[secrets.ts:41](https://github.com/1Password/1password-js-sdk/blob/b037da5/client/src/secrets.ts#L41)
