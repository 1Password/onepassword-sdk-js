[@1password/sdk](../README.md) / [Modules](../modules.md) / [secrets](../modules/secrets.md) / SecretsApi

# Interface: SecretsApi

[secrets](../modules/secrets.md).SecretsApi

Exposes functionality for retrieving secrets.

## Implemented by

- [`SecretsSource`](../classes/secrets.SecretsSource.md)

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

#### Defined in

[secrets.ts:17](https://github.com/1Password/1password-js-sdk/blob/8f949b4/client/src/secrets.ts#L17)
