import { BigNumberish } from 'ethers';
import { GeniDexCore } from './genidex.core';
import { Balances } from './balances';
import { TokenInfo, Market } from "../types";
export declare class GeniDexContract extends GeniDexCore {
    provider: any;
    tokens: Record<string, TokenInfo>;
    address: string;
    balances: Balances;
    constructor(address: string, provider: any);
    /**
     * Fetch all existing markets and return them as an object indexed by market ID.
     * @returns A Promise resolving to a record of markets keyed by market ID.
     */
    getAllMarkets(): Promise<Record<string, Market>>;
    /**
     * Fetch a single market by ID from the GeniDex contract.
     *
     * @param marketId - The ID of the market to fetch.
     * @returns A Promise resolving to a Market object.
     */
    getMarket(marketId: BigNumberish): Promise<Market>;
    /**
     * Fetch all unique token addresses that are listed in any market.
     * This includes both base and quote tokens.
     * @returns A Promise resolving to an array of unique token addresses.
     */
    getAllListedTokens(): Promise<string[]>;
    /**
     * Fetch metadata for all unique tokens listed in any market.
     * Returns a record where keys are token addresses (lowercased)
     * and values are TokenInfo objects.
     *
     * Example:
     * {
     *   "0xabc...": { tokenAddress: "0xabc...", symbol: "USDC", ... },
     *   "0xdef...": { tokenAddress: "0xdef...", symbol: "WETH", ... },
     * }
     *
     * @returns Promise resolving to a record of tokenAddress -> TokenInfo.
     */
    getAllListedTokenMeta(): Promise<Record<string, TokenInfo>>;
}
