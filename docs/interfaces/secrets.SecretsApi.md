[@1password/sdk](../README.md) / [Modules](../modules.md) / [secrets](../modules/secrets.md) / SecretsApi

# Interface: SecretsApi

[secrets](../modules/secrets.md).SecretsApi

Exposes functionality related to secret references.

## Implemented by

- [`SecretsSource`](../classes/secrets.SecretsSource.md)

## Methods

### resolve

▸ **resolve**(`secretReference`): `Promise`\<`string`\>

Takes as input a secret reference and returns the secret to which it points.

#### Parameters

| Name | Type |
| :------ | :------ |
| `secretReference` | `string` |

#### Returns

`Promise`\<`string`\>

#### Defined in

secrets.ts:9
