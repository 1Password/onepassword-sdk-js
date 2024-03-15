[@1password/sdk](../README.md) / [Modules](../modules.md) / [secrets](../modules/secrets.md) / SecretsSource

# Class: SecretsSource

[secrets](../modules/secrets.md).SecretsSource

## Implements

- [`SecretsApi`](../interfaces/secrets.SecretsApi.md)

## Constructors

### constructor

• **new SecretsSource**(`inner`): [`SecretsSource`](secrets.SecretsSource.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `inner` | [`InnerClient`](../interfaces/configuration.InnerClient.md) |

#### Returns

[`SecretsSource`](secrets.SecretsSource.md)

#### Defined in

[secrets.ts:14](https://github.com/1Password/1password-js-sdk/blob/14cb468/client/src/secrets.ts#L14)

## Properties

### #inner

• `Private` **#inner**: [`InnerClient`](../interfaces/configuration.InnerClient.md)

#### Defined in

[secrets.ts:12](https://github.com/1Password/1password-js-sdk/blob/14cb468/client/src/secrets.ts#L12)

## Methods

### resolve

▸ **resolve**(`secretReference`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `secretReference` | `string` |

#### Returns

`Promise`\<`string`\>

#### Implementation of

[SecretsApi](../interfaces/secrets.SecretsApi.md).[resolve](../interfaces/secrets.SecretsApi.md#resolve)

#### Defined in

[secrets.ts:18](https://github.com/1Password/1password-js-sdk/blob/14cb468/client/src/secrets.ts#L18)
