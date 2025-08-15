import { AddressLike, BigNumberish, Overrides, Signer, TransactionRequest } from "ethers";

export interface WriteContractParams{
    signer: Signer;
    args?: any[];
    overrides?: TransactionRequest
}

export interface ListTokenParams{
    signer: Signer;
    tokenAddress: AddressLike;
    usdMarketID: BigNumberish;
    minOrderAmount: BigNumberish;
    minTransferAmount: BigNumberish;
    isUSD: boolean;
    autoDetect: boolean;
    manualSymbol?: String;
    manualDecimals?: BigNumberish;
    overrides?: Overrides;
}

export interface AddMarketParams{
    signer: Signer;
    quoteToken: AddressLike;
    baseToken: AddressLike;
    overrides?: Overrides;
}

export interface UpdateFeeReceiverParams{
    signer: Signer;
    newAddress: AddressLike;
    overrides?: Overrides;
}

export interface SetGeniRewarderParams{
    signer: Signer;
    rewarderAddress: AddressLike;
    overrides?: Overrides;
}

export interface UpdateTokenIsUSDParams {
    signer: Signer;
    tokenAddress: AddressLike;
    isUSD: boolean;
    overrides?: Overrides;
}

export interface UpdateUSDMarketIDParams {
    signer: Signer;
    tokenAddress: AddressLike;
    marketID: bigint | number;
    overrides?: Overrides;
}

export interface UpdateMinOrderAmountParams {
    signer: Signer;
    tokenAddress: AddressLike;
    minOrderAmount: bigint | number;
    overrides?: Overrides;
}

export interface UpdateMinTransferAmountParams {
    signer: Signer;
    tokenAddress: AddressLike;
    minTransferAmount: bigint | number;
    overrides?: Overrides;
}

export interface UpdateMarketIsRewardableParams {
    signer: Signer;
    marketId: bigint | number;
    isRewardable: boolean;
    overrides?: Overrides;
}