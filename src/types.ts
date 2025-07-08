import { AddressLike, BigNumberish, ContractTransactionReceipt, ContractTransactionResponse, Overrides, Signer, TransactionReceipt, TransactionRequest } from "ethers";


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
  Geni        = "geni",
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

export interface MarketMap {
  [marketId: string]: Market;
};

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
  userID: bigint;
  price: bigint;
  quantity: bigint;
  blockNumber: bigint | null;
}

export interface Orders {
  [marketId: string]: OutputOrder[];
};

export interface WriteContractParams{
    signer: Signer;
    method: string;
    args?: any[];
    overrides?: TransactionRequest
}

export interface OrderParams{
    signer: Signer;
    marketId: BigNumberish;
    normPrice: BigNumberish;
    normQuantity: BigNumberish;
    referrer?: AddressLike;
    overrides?: Overrides;
}
export interface  CancelOrderParams {
  signer: Signer,
  marketId: BigNumberish,
  orderIndex: BigNumberish,
  overrides?: Overrides
}

export interface GeniDexTransactionResponse extends ContractTransactionResponse {
  waitForConfirms(): Promise<TransactionReceipt | undefined>;
}

export interface WaitOpts {
  confirmations?: number;
  timeoutMs?: number;
  pollMs?: number;
  onProgress?: (currentConf: number) => void;
}