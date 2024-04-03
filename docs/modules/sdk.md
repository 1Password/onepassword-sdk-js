[@1password/sdk](../README.md) / [Modules](../modules.md) / sdk

# Module: sdk

## References

### Client

Re-exports [Client](../classes/client.Client.md)

## Variables

### DEFAULT\_INTEGRATION\_NAME

• `Const` **DEFAULT\_INTEGRATION\_NAME**: ``"Unknown"``

#### Defined in

[sdk.ts:6](https://github.com/1Password/1password-js-sdk/blob/8f949b4/client/src/sdk.ts#L6)

___

### DEFAULT\_INTEGRATION\_VERSION

• `Const` **DEFAULT\_INTEGRATION\_VERSION**: ``"Unknown"``

#### Defined in

[sdk.ts:7](https://github.com/1Password/1password-js-sdk/blob/8f949b4/client/src/sdk.ts#L7)

## Functions

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

[sdk.ts:15](https://github.com/1Password/1password-js-sdk/blob/8f949b4/client/src/sdk.ts#L15)
