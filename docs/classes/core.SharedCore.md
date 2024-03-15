[@1password/sdk](../README.md) / [Modules](../modules.md) / [core](../modules/core.md) / SharedCore

# Class: SharedCore

[core](../modules/core.md).SharedCore

## Implements

- [`Core`](../interfaces/core.Core.md)

## Constructors

### constructor

• **new SharedCore**(): [`SharedCore`](core.SharedCore.md)

#### Returns

[`SharedCore`](core.SharedCore.md)

## Methods

### initClient

▸ **initClient**(`config`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ClientAuthConfig`](../interfaces/core.ClientAuthConfig.md) |

#### Returns

`Promise`\<`string`\>

#### Implementation of

[Core](../interfaces/core.Core.md).[initClient](../interfaces/core.Core.md#initclient)

#### Defined in

core.ts:44

___

### invoke

▸ **invoke**(`config`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`InvokeConfig`](../interfaces/core.InvokeConfig.md) |

#### Returns

`Promise`\<`string`\>

#### Implementation of

[Core](../interfaces/core.Core.md).[invoke](../interfaces/core.Core.md#invoke)

#### Defined in

core.ts:49

___

### releaseClient

▸ **releaseClient**(`clientId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `clientId` | `number` |

#### Returns

`void`

#### Implementation of

[Core](../interfaces/core.Core.md).[releaseClient](../interfaces/core.Core.md#releaseclient)

#### Defined in

core.ts:54
