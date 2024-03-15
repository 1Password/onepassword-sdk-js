[@1password/sdk](../README.md) / [Modules](../modules.md) / client

# Module: client

Module containing the 1Password SDK Client, which can be used to authenticate and access data stored in 1Password programmatically.

## Classes

- [Client](../classes/client.Client.md)

## Variables

### DEFAULT\_INTEGRATION\_NAME

• `Const` **DEFAULT\_INTEGRATION\_NAME**: ``"Unknown"``

#### Defined in

[client.ts:10](https://github.com/1Password/1password-js-sdk/blob/b037da5/client/src/client.ts#L10)

___

### DEFAULT\_INTEGRATION\_VERSION

• `Const` **DEFAULT\_INTEGRATION\_VERSION**: ``"Unknown"``

#### Defined in

[client.ts:11](https://github.com/1Password/1password-js-sdk/blob/b037da5/client/src/client.ts#L11)

## Functions

### clientAuthConfig

▸ **clientAuthConfig**(`userConfig`): `ClientAuthConfig`

Creates a default client configuration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `userConfig` | [`ClientConfiguration`](../interfaces/configuration.ClientConfiguration.md) |

#### Returns

`ClientAuthConfig`

The client configuration to instantiate the client with.

#### Defined in

[client.ts:63](https://github.com/1Password/1password-js-sdk/blob/b037da5/client/src/client.ts#L63)

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

[client.ts:26](https://github.com/1Password/1password-js-sdk/blob/b037da5/client/src/client.ts#L26)

___

### createClientWithCore

▸ **createClientWithCore**(`config`, `core`): `Promise`\<[`Client`](../classes/client.Client.md)\>

Creates a 1Password SDK client with a given core implementation.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ClientConfiguration`](../interfaces/configuration.ClientConfiguration.md) |
| `core` | `Core` |

#### Returns

`Promise`\<[`Client`](../classes/client.Client.md)\>

The authenticated 1Password SDK client.

#### Defined in

[client.ts:34](https://github.com/1Password/1password-js-sdk/blob/b037da5/client/src/client.ts#L34)
