[@1password/sdk](../README.md) / [Modules](../modules.md) / client

# Module: client

## Table of contents

### Classes

- [Client](../classes/client.Client.md)

### Variables

- [DEFAULT\_INTEGRATION\_NAME](client.md#default_integration_name)
- [DEFAULT\_INTEGRATION\_VERSION](client.md#default_integration_version)

### Functions

- [clientAuthConfig](client.md#clientauthconfig)
- [createClient](client.md#createclient)
- [createClientWithCore](client.md#createclientwithcore)

## Variables

### DEFAULT\_INTEGRATION\_NAME

• `Const` **DEFAULT\_INTEGRATION\_NAME**: ``"Unknown"``

#### Defined in

client.ts:6

___

### DEFAULT\_INTEGRATION\_VERSION

• `Const` **DEFAULT\_INTEGRATION\_VERSION**: ``"Unknown"``

#### Defined in

client.ts:7

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

client.ts:59

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

client.ts:22

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

client.ts:30
