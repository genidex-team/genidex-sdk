
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