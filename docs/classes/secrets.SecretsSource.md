[@1password/sdk](../README.md) / [Modules](../modules.md) / [secrets](../modules/secrets.md) / SecretsSource

# Class: SecretsSource

[secrets](../modules/secrets.md).SecretsSource

Exposes functionality related to secret references.

## Implements

- [`SecretsApi`](../interfaces/secrets.SecretsApi.md)

## Table of contents

### Constructors

- [constructor](secrets.SecretsSource.md#constructor)

### Properties

- [#inner](secrets.SecretsSource.md##inner)

### Methods

- [resolve](secrets.SecretsSource.md#resolve)

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

secrets.ts:18

## Properties

### #inner

• `Private` **#inner**: [`InnerClient`](../interfaces/configuration.InnerClient.md)

#### Defined in

secrets.ts:16

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

#### Implementation of

[SecretsApi](../interfaces/secrets.SecretsApi.md).[resolve](../interfaces/secrets.SecretsApi.md#resolve)

#### Defined in

secrets.ts:23
