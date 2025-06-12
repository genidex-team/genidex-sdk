
---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

# GeniDex SDK – Getting Started

Welcome to the GeniDex SDK. This guide helps you install and use the SDK to interact with GeniDex smart contracts across multiple chains.

---

## 📦 Installation

Install from a local path (for development):

```bash
npm install ../genidex-sdk
````

Or from npm (when published):

```bash
npm install genidex-sdk
```

---

## ✨ Importing

### Import specific classes:

```ts
import { GeniDexCore, GeniDexContract, ERC20 } from 'genidex-sdk';

const core = new GeniDexCore(contractAddress, provider);
const dex = new GeniDexContract(core.getContract());
```

### Or import everything via default:

```ts
import genidexSDK from 'genidex-sdk';

const core = new genidexSDK.GeniDexCore(contractAddress, provider);
```

---

## 🚀 Example Usage

### Deposit ETH

```ts
await core.getContract(signer).depositEth({ value: BigInt(1e18) }); // 1 ETH
```

### Get all listed tokens

```ts
const tokens = await dex.getAllListedTokenMeta();
console.log(tokens);
```

### Place a buy order

```ts
await dex.placeBuyOrder({
  signer,
  marketId: 1n,
  normPrice: 1500n * 10n ** 18n,
  normQuantity: 1n * 10n ** 18n,
  referrer: genidexSDK.ZERO_ADDRESS,
});
```

---

## 📘 Notes

* All amounts are in **18 decimals** format (normalized).
* All methods use **Ethers v6**.
* Contracts are modular and can be imported individually.


