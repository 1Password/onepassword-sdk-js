[@1password/sdk](../README.md) / [Modules](../modules.md) / client\_builder

# Module: client\_builder

## Functions

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

[client_builder.ts:15](https://github.com/1Password/1password-js-sdk/blob/8f949b4/client/src/client_builder.ts#L15)
