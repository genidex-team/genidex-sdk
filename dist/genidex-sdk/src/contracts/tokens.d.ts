import { Contract } from 'ethers';
import { GeniDex } from './genidex';
import { TokenInfo } from '../types';
export declare class Tokens {
    genidex: GeniDex;
    contract: Contract;
    tokensInfo: Record<string, TokenInfo>;
    constructor(_genidex: GeniDex);
    /**
     * Fetch metadata for a list of token addresses from the GeniDex contract.
     *
     * This method calls the on-chain `getTokensInfo(address[])` view function,
     * which returns details such as symbol, decimals, and market association for each token.
     *
     * @param tokenAddresses - An array of token contract addresses to query.
     * @returns A Promise resolving to an array of TokenInfo objects containing metadata for each token.
     *
     * Example output:
     * [
     *   {
     *     tokenAddress: "0xabc...",
     *     symbol: "USDC",
     *     usdMarketID: 1n,
     *     minOrderAmount: 10000000000000000000n
     *     decimals: 6,
     *     isUSD: true
     *   },
     *   ...
     * ]
     */
    getTokensInfo(tokenAddresses: string[]): Promise<TokenInfo[]>;
    /**
     * Get metadata of a specific token.
     * If already cached, return from this.tokens.
     * Otherwise, fetch from contract and cache it.
     *
     * @param tokenAddress The address of the token.
     * @returns Promise resolving to TokenInfo or undefined if fetch fails.
     */
    getTokenInfo(tokenAddress: string): Promise<TokenInfo | any>;
    /**
     * Fetch all unique token addresses that are listed in any market.
     * This includes both base and quote tokens.
     * @returns A Promise resolving to an array of unique token addresses.
     */
    getAllTokens(): Promise<string[]>;
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
    getAllTokensInfo(): Promise<Record<string, TokenInfo>>;
}
