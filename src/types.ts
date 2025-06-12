import { BigNumberish, ContractTransactionReceipt, ContractTransactionResponse, Signer, TransactionReceipt } from "ethers";


export enum NetworkName {
  Ethereum  = "ethereum",
  Optimism  = "optimism",
  Arbitrum  = "arbitrum",
  Base      = "base",
  // BNBChain = "bnb",
  // Polygon = "polygon",
  // Avalanche = "avalanche",

  // Testnet
  ArbSepolia  = "arb_sepolia",
  OpSepolia   = "op_sepolia",
  BaseSepolia = "base_sepolia",
  Sepolia     = "sepolia",
  Hardhat     = "hardhat",
  Localhost   = "localhost",
}

export interface ContractAddresses {
  GeniDex: string;
  GeniToken: string | null;
  GeniRewarder: string | null;
}

export interface NetworkConfig {
  chainId: bigint;
  name: string;
  contracts: ContractAddresses;
}

export interface Networks {
  [networkName: string]: NetworkConfig;
}

export interface RawNetworkConfig {
  chainId: number;
  contracts: ContractAddresses;
}

export interface RawNetworks {
  [networkName: string]: RawNetworkConfig;
};

export interface Market {
  symbol: string;
  id: bigint;
  price: bigint;
  lastUpdatePrice: bigint;
  baseAddress: string;
  quoteAddress: string;
  creator: string;
  isRewardable: boolean;
}

export interface TokenInfo {
  tokenAddress: string;
  symbol: string;
  usdMarketID: bigint;
  decimals: number;
  isUSD: boolean;
}

export interface OutputOrder {
  id: bigint;
  trader: string;
  price: bigint;
  quantity: bigint;
}

export interface orderParams{
    signer: Signer;
    marketId: BigNumberish;
    normPrice: BigNumberish;
    normQuantity: BigNumberish;
    referrer: string;
    waitForConfirm?: boolean;
}

export interface GeniDexTransactionResponse extends ContractTransactionResponse {
  waitForConfirms(): Promise<TransactionReceipt>;
}