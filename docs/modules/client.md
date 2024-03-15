[@1password/sdk](../README.md) / [Modules](../modules.md) / client

# Module: client

## Classes

- [Client](../classes/client.Client.md)

## Variables

### DEFAULT\_INTEGRATION\_NAME

• `Const` **DEFAULT\_INTEGRATION\_NAME**: ``"Unknown"``

#### Defined in

[client.ts:6](https://github.com/1Password/1password-js-sdk/blob/14cb468/client/src/client.ts#L6)

___

### DEFAULT\_INTEGRATION\_VERSION

• `Const` **DEFAULT\_INTEGRATION\_VERSION**: ``"Unknown"``

#### Defined in

[client.ts:7](https://github.com/1Password/1password-js-sdk/blob/14cb468/client/src/client.ts#L7)

## Functions

### clientAuthConfig

▸ **clientAuthConfig**(`userConfig`): [`ClientAuthConfig`](../interfaces/core.ClientAuthConfig.md)

Creates a default client configuration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `userConfig` | [`ClientConfiguration`](../interfaces/configuration.ClientConfiguration.md) |

#### Returns

[`ClientAuthConfig`](../interfaces/core.ClientAuthConfig.md)

The client configuration to instantiate the client with.

#### Defined in

[client.ts:59](https://github.com/1Password/1password-js-sdk/blob/14cb468/client/src/client.ts#L59)

___

### createClient

▸ **createClient**(`config`): `Promise`\<[`Client`](../classes/client.Client.md)\>

Creates a default 1Password SDK client.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ClientConfiguration`](../interfaces/configuration.ClientConfiguration.md) |

#### Returns

`Promise`\<[`Client`](../classes/client.Client.md)\>

The authenticated 1Password SDK client.

#### Defined in

[client.ts:22](https://github.com/1Password/1password-js-sdk/blob/14cb468/client/src/client.ts#L22)

___

### createClientWithCore

▸ **createClientWithCore**(`config`, `core`): `Promise`\<[`Client`](../classes/client.Client.md)\>

Creates a 1Password SDK client with a given core implementation.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ClientConfiguration`](../interfaces/configuration.ClientConfiguration.md) |
| `core` | [`Core`](../interfaces/core.Core.md) |

#### Returns

`Promise`\<[`Client`](../classes/client.Client.md)\>

The authenticated 1Password SDK client.

#### Defined in

[client.ts:30](https://github.com/1Password/1password-js-sdk/blob/14cb468/client/src/client.ts#L30)
