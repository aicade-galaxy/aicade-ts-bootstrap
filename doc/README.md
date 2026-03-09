# Aicade TS SDK API Reference

Canonical API Reference for integrating `aicade-ts-sdk`.

This document is optimized for:
- Human integration workflows (quick setup + predictable API lookup)
- AI model parsing (stable headings, normalized signatures, explicit parameter/return contracts)

## Table Of Contents

- [1. Scope](#1-scope)
- [2. Package Basics](#2-package-basics)
- [3. Integration Flow](#3-integration-flow)
- [4. Core SDK Reference](#4-core-sdk-reference)
- [5. Module Index](#5-module-index)
- [6. Module API Reference](#6-module-api-reference)
- [7. Utility API Reference](#7-utility-api-reference)
- [8. Event Reference](#8-event-reference)
- [9. Error Handling](#9-error-handling)
- [10. AI-Friendly API Index](#10-ai-friendly-api-index)
- [11. Related Docs](#11-related-docs)

## 1. Scope

Covered runtime APIs:
- `AicadeSDK`
- Built-in business modules (`Application`, `Ticket`, `AppScore`, `AicadeCurrency`, `AIChat`, `AICoinMarket`, `Token`, `NftOwner`, `LocalStorageTools`)
- Utility exports (`Web3Utils`, `bigNumber`, etc.)

Not covered:
- Internal private classes/adapters implementation details
- Any method not in the shipped SDK runtime (for example: `execute(...)` is not supported)

## 2. Package Basics

Install:

```bash
npm install aicade-ts-sdk lodash
```

Supported platforms (`init.options.platform`):
- `react`
- `vue`
- `vanilla`

Minimal bootstrap:

```ts
import { AicadeSDK } from "aicade-ts-sdk";

const sdk = new AicadeSDK();
await sdk.init({
  platform: "react",
  config: {
    apiKey: "your-api-key",
    debug: true,
    timeout: 15000,
  },
});
await sdk.waitForReady();
```

## 3. Integration Flow

1. Create SDK instance.
2. Call `init(...)` once.
3. Call `waitForReady()` before business calls.
4. Get modules via `getModule(...)` and reuse instances.
5. Subscribe events where needed; store remove handlers.
6. On app teardown, call `destroy()`.

## 4. Core SDK Reference

### 4.1 Types

`InitOptions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `platform` | `"react" \| "vue" \| "vanilla"` | yes | Target runtime platform |
| `config.apiKey` | `string` | yes | API key for auth/signature related flows |
| `config.debug` | `boolean` | no | Debug log toggle |
| `config.timeout` | `number` | no | Request timeout in ms |

### 4.2 Methods

#### `init(options)`

Signature:

```ts
init(options: InitOptions): Promise<void>
```

#### `waitForReady()`

Signature:

```ts
waitForReady(): Promise<void>
```

#### `destroy()`

Signature:

```ts
destroy(): Promise<void>
```

#### `getModule(name)`

Signature:

```ts
getModule<T extends IModule>(name: ModuleType): T
```

Notes:
- `name` must match built-in module keys exactly (see [5. Module Index](#5-module-index)).

#### `Login()`

Signature:

```ts
Login(): Promise<AccountInfo>
```

#### `GetAccountInfo()`

Signature:

```ts
GetAccountInfo(): AccountInfo | null
```

#### `post(namespace, method, ...args)`

Signature:

```ts
post(namespace: string, method: string, ...args: any[]): Promise<void>
```

#### `tryPost(namespace, method, ...args)`

Signature:

```ts
tryPost(namespace: string, method: string, ...args: any[]): Promise<unknown>
```

#### `fetchObject(namespace, method, ...args)`

Signature:

```ts
fetchObject<T>(namespace: string, method: string, ...args: any[]): Promise<T>
```

#### `tryFetchObject(namespace, method, ...args)`

Signature:

```ts
tryFetchObject<T>(namespace: string, method: string, ...args: any[]): Promise<T>
```

### 4.3 SDK-Level Events

#### `on(eventType, callback)`

Signature:

```ts
on(eventType: string, callback: (...args: any[]) => void): RemoveListener
```

#### `off(eventType, callback?)`

Signature:

```ts
off(eventType: string, callback?: (...args: any[]) => void): boolean
```

Global events used by built-in modules:
- `AccountChanges` -> callback payload: `AccountInfo`
- `PointCurrencyChange` -> callback payload: `number`

## 5. Module Index

| Module Key | Primary Domain |
| --- | --- |
| `Application` | App metadata and lifecycle |
| `Ticket` | Access/payment gate |
| `AppScore` | Score and leaderboard |
| `AicadeCurrency` | Point/token economy |
| `AIChat` | Chat sessions and messages |
| `AICoinMarket` | MCP market assistant + stream |
| `Token` | Token balance and swap |
| `NftOwner` | NFT ownership/avatar |
| `LocalStorageTools` | App-scoped key-value storage |

## 6. Module API Reference

### 6.1 `Application`

#### Methods

| Method | Signature | Returns | Description |
| --- | --- | --- | --- |
| `GetInfo` | `GetInfo(): Promise<ApplicationInfo>` | `Promise<ApplicationInfo>` | Get app metadata |
| `Exit` | `Exit(): void` | `void` | Exit app |

#### Events

No dedicated module events.

### 6.2 `Ticket`

#### Properties

| Property | Type | Description |
| --- | --- | --- |
| `CurPaymentMethod` | `"free" \| "one" \| "subscribe"` | Current payment mode |
| `CanPlay` | `boolean` | Current playable status |

#### Methods

| Method | Signature | Returns | Description |
| --- | --- | --- | --- |
| `refresh` | `refresh(): Promise<boolean>` | `Promise<boolean>` | Refresh ticket state |
| `buy` | `buy(): Promise<boolean>` | `Promise<boolean>` | Create ticket/subscribe by mode |
| `play` | `play(): Promise<boolean>` | `Promise<boolean>` | Start play flow (may consume ticket) |

#### Events

| Event API | Signature | Callback Payload |
| --- | --- | --- |
| `on("TicketChanges", cb)` | `on("TicketChanges", cb: (canPlay: boolean) => void): RemoveListener` | `canPlay: boolean` |
| `off("TicketChanges", cb?)` | `off("TicketChanges", cb?: (canPlay: boolean) => void): boolean` | n/a |

### 6.3 `AppScore`

#### Properties

| Property | Type | Description |
| --- | --- | --- |
| `CurScore` | `number` | Current score snapshot |

#### Methods

| Method | Signature | Returns | Description |
| --- | --- | --- | --- |
| `refresh` | `refresh(): Promise<number>` | `Promise<number>` | Refresh score |
| `getRanks` | `getRanks(): Promise<AppScoreRank[]>` | `Promise<AppScoreRank[]>` | Get leaderboard |
| `setScore` | `setScore(score: number): Promise<number>` | `Promise<number>` | Update score (`>0` inc, `<0` dec, `0` clear backend-dependent) |

#### Events

| Event API | Signature | Callback Payload |
| --- | --- | --- |
| `on("AppScoreChanges", cb)` | `on("AppScoreChanges", cb: (score: number) => void): RemoveListener` | `score: number` |
| `off("AppScoreChanges", cb?)` | `off("AppScoreChanges", cb?: (score: number) => void): boolean` | n/a |

### 6.4 `AicadeCurrency`

#### Properties

| Property | Type | Description |
| --- | --- | --- |
| `CurrencyBlanaces` | `{ token: BN; point: number; pointOfChain: BN }` | Balances snapshot (name is SDK-defined) |

#### Methods

| Method | Signature | Returns | Description |
| --- | --- | --- | --- |
| `refreshPoint` | `refreshPoint(): Promise<void>` | `Promise<void>` | Refresh point only |
| `refresh` | `refresh(): Promise<void>` | `Promise<void>` | Refresh point + token balances |
| `consume` | `consume(num: number, scene: string, message?: string): Promise<number>` | `Promise<number>` | Consume points and return latest point |
| `obtain` | `obtain(scene: string, expendNum: number, rewardAicadeScore: number): Promise<number>` | `Promise<number>` | Exchange app points to platform points |

#### Events

Module event API:

| Event API | Signature | Callback Payload |
| --- | --- | --- |
| `on(eventType, cb)` | `on(eventType: string, cb: (...args: any[]) => void): RemoveListener` | event-specific |
| `off(eventType, cb?)` | `off(eventType: string, cb?: (...args: any[]) => void): boolean` | n/a |

Related SDK global event:

| Event API | Signature | Callback Payload |
| --- | --- | --- |
| `sdk.on("PointCurrencyChange", cb)` | `on("PointCurrencyChange", cb: (point: number) => void): RemoveListener` | `point: number` |

### 6.5 `AIChat`

#### Methods

| Method | Signature | Returns | Description |
| --- | --- | --- | --- |
| `getSessionList` | `getSessionList(): Promise<AIChatSession[]>` | `Promise<AIChatSession[]>` | List sessions |
| `createSession` | `createSession(firstMessage: string): Promise<AIChatSession>` | `Promise<AIChatSession>` | Create session with first message |
| `getMessages` | `getMessages(sessionId: string): Promise<AIChatMessage[]>` | `Promise<AIChatMessage[]>` | List messages in session |
| `createMessage` | `createMessage(sessionId: string, message: string): Promise<AIChatMessage>` | `Promise<AIChatMessage>` | Send message |

#### Events

No dedicated module events.

### 6.6 `AICoinMarket`

#### Methods

| Method | Signature | Returns | Description |
| --- | --- | --- | --- |
| `bindApiKey` | `bindApiKey(apiKey: string, secretKey: string): Promise<boolean>` | `Promise<boolean>` | Bind MCP credentials |
| `getApiKey` | `getApiKey(): Promise<string>` | `Promise<string>` | Get bound key/config string |
| `unbindApiKey` | `unbindApiKey(): Promise<boolean>` | `Promise<boolean>` | Unbind MCP credentials |
| `createEventSource` | `createEventSource(): Promise<boolean>` | `Promise<boolean>` | Create stream channel |
| `sendMessage` | `sendMessage(content: string): Promise<boolean>` | `Promise<boolean>` | Send message |
| `getMessages` | `getMessages(): Promise<AICoinMarketMessageResponse[]>` | `Promise<AICoinMarketMessageResponse[]>` | Read history |

#### Events

| Event API | Signature | Callback Payload |
| --- | --- | --- |
| `OnReciveMessage(cb)` | `OnReciveMessage(cb: (msg: AICoinMarketMessageResponse) => void): RemoveListener` | `msg: AICoinMarketMessageResponse` |

### 6.7 `Token`

#### Methods

| Method | Signature | Returns | Description |
| --- | --- | --- | --- |
| `balanceOf` | `balanceOf(address: string): Promise<BN>` | `Promise<BN>` | Query token balance |
| `swap` | `swap(request: TokenSwapInfo): Promise<void>` | `Promise<void>` | Execute swap flow |

#### Events

No dedicated module events.

### 6.8 `NftOwner`

#### Methods

| Method | Signature | Returns | Description |
| --- | --- | --- | --- |
| `GetAllContracts` | `GetAllContracts(): Promise<NftContractInfo[]>` | `Promise<NftContractInfo[]>` | List NFT contracts |
| `GetNftTokenList` | `GetNftTokenList(nftContract: string, forceRefresh?: boolean): Promise<NftTokenInfo[]>` | `Promise<NftTokenInfo[]>` | List owned tokens in a contract |
| `GetAvatar` | `GetAvatar(): Promise<NftAvatarInfo>` | `Promise<NftAvatarInfo>` | Get current avatar |
| `SetUpUserAvatar` | `SetUpUserAvatar(contractAddress: string, token: string): Promise<NftAvatarInfo>` | `Promise<NftAvatarInfo>` | Set avatar NFT |

#### Events

No dedicated module events.

### 6.9 `LocalStorageTools`

#### Methods

| Method | Signature | Returns | Description |
| --- | --- | --- | --- |
| `setItem` | `setItem(key: string, value: string): Promise<void>` | `Promise<void>` | Write item |
| `getItem` | `getItem(key: string): Promise<string | null>` | `Promise<string \| null>` | Read item |
| `removeItem` | `removeItem(key: string): Promise<void>` | `Promise<void>` | Remove item |
| `clear` | `clear(): Promise<void>` | `Promise<void>` | Clear app-scoped keys |

#### Events

No dedicated module events.

## 7. Utility API Reference

### 7.1 Number And Web3 Helpers

| API | Signature | Returns | Description |
| --- | --- | --- | --- |
| `Web3Utils.parseUnits` | `parseUnits(value: string | number | BN, unitType?: "ether" | "wei"): BN` | `BN` | Convert value into BN units |
| `Web3Utils.parseEther` | `parseEther(value: string | number | BN): BN` | `BN` | Convert ether to wei BN |
| `Web3Utils.format` | `format(value: BN, decimals?: number, fixed?: number, commify?: boolean, pad?: boolean): string` | `string` | Format BN display |
| `bigNumber` | `bigNumber(value: string | number | BN): BN` | `BN` | Convert input to BN |
| `bigNumberToInt` | `bigNumberToInt(value: string | number | BN): number` | `number` | Convert BN-like input to number |
| `formatBN` | `formatBN(value: string | number | BN, decimals?: number, commify?: boolean): string` | `string` | Format BN-like value |

### 7.2 Runtime Helpers

| API | Signature | Returns | Description |
| --- | --- | --- | --- |
| `detectPlatform` | `detectPlatform(): string` | `string` | Detect runtime platform |
| `waitUntil` | `waitUntil(onCheck: () => boolean, checkInterval?: number): Promise<void>` | `Promise<void>` | Poll until condition is true |

## 8. Event Reference

### 8.1 SDK-Level Events

| Event Name | Emitter | Payload |
| --- | --- | --- |
| `AccountChanges` | `AicadeSDK` | `AccountInfo` |
| `PointCurrencyChange` | `AicadeSDK` | `number` |

### 8.2 Module-Level Events

| Module | Event | Payload |
| --- | --- | --- |
| `Ticket` | `TicketChanges` | `boolean` |
| `AppScore` | `AppScoreChanges` | `number` |
| `AICoinMarket` | `ReceiveMessage` (subscribed via `OnReciveMessage`) | `AICoinMarketMessageResponse` |

## 9. Error Handling

Recommended pattern:

```ts
try {
  await sdk.init({ platform: "react", config: { apiKey, debug: false, timeout: 15000 } });
  await sdk.waitForReady();
} catch (err) {
  console.error("SDK init failed", err);
}
```

Guidelines:
- Wrap all async module calls in `try/catch`.
- Validate required params before calling APIs.
- Keep a fallback UI state for network/signature failures.
- Always release listeners via returned remove functions.

## 10. AI-Friendly API Index

Machine-readable summary (stable keys for retrieval/synthesis):

```json
{
  "sdk": {
    "methods": [
      "init",
      "waitForReady",
      "destroy",
      "getModule",
      "Login",
      "GetAccountInfo",
      "post",
      "tryPost",
      "fetchObject",
      "tryFetchObject",
      "on",
      "off"
    ]
  },
  "modules": {
    "Application": ["GetInfo", "Exit"],
    "Ticket": ["CurPaymentMethod", "CanPlay", "refresh", "buy", "play", "on", "off"],
    "AppScore": ["CurScore", "refresh", "getRanks", "setScore", "on", "off"],
    "AicadeCurrency": ["CurrencyBlanaces", "refreshPoint", "refresh", "consume", "obtain", "on", "off"],
    "AIChat": ["getSessionList", "createSession", "getMessages", "createMessage"],
    "AICoinMarket": ["bindApiKey", "getApiKey", "unbindApiKey", "createEventSource", "sendMessage", "getMessages", "OnReciveMessage"],
    "Token": ["balanceOf", "swap"],
    "NftOwner": ["GetAllContracts", "GetNftTokenList", "GetAvatar", "SetUpUserAvatar"],
    "LocalStorageTools": ["setItem", "getItem", "removeItem", "clear"]
  },
  "utilities": [
    "Web3Utils.parseUnits",
    "Web3Utils.parseEther",
    "Web3Utils.format",
    "bigNumber",
    "bigNumberToInt",
    "formatBN",
    "detectPlatform",
    "waitUntil"
  ]
}
```

## 11. Related Docs

- [AICreateApplication](./AICreateApplication.md)
