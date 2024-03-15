[@1password/sdk](../README.md) / [Modules](../modules.md) / [core](../modules/core.md) / Core

# Interface: Core

[core](../modules/core.md).Core

## Implemented by

- [`SharedCore`](../classes/core.SharedCore.md)

## Methods

### initClient

▸ **initClient**(`config`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ClientAuthConfig`](core.ClientAuthConfig.md) |

#### Returns

`Promise`\<`string`\>

#### Defined in

[core.ts:6](https://github.com/1Password/1password-js-sdk/blob/14cb468/client/src/core.ts#L6)

___

### invoke

▸ **invoke**(`config`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`InvokeConfig`](core.InvokeConfig.md) |

#### Returns

`Promise`\<`string`\>

#### Defined in

[core.ts:8](https://github.com/1Password/1password-js-sdk/blob/14cb468/client/src/core.ts#L8)

___

### releaseClient

▸ **releaseClient**(`clientId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `clientId` | `number` |

#### Returns

`void`

#### Defined in

[core.ts:10](https://github.com/1Password/1password-js-sdk/blob/14cb468/client/src/core.ts#L10)
