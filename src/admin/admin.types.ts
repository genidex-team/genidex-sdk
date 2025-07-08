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