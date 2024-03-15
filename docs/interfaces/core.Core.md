[@1password/sdk](../README.md) / [Modules](../modules.md) / [core](../modules/core.md) / Core

# Interface: Core

[core](../modules/core.md).Core

## Implemented by

- [`SharedCore`](../classes/core.SharedCore.md)

## Table of contents

### Methods

- [initClient](core.Core.md#initclient)
- [invoke](core.Core.md#invoke)
- [releaseClient](core.Core.md#releaseclient)

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

core.ts:6

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

core.ts:8

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

core.ts:10
