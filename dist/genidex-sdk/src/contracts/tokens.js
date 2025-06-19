import { isAddress } from 'ethers';
export class Tokens {
    constructor(_genidex) {
        this.tokensInfo = {};
        this.genidex = _genidex;
        this.contract = _genidex.contract;
    }
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
    async getTokensInfo(tokenAddresses) {
        const rawResults = await this.contract.getTokensInfo(tokenAddresses);
        return rawResults.map((item) => ({
            tokenAddress: item.tokenAddress,
            symbol: item.symbol,
            usdMarketID: BigInt(item.usdMarketID.toString()),
            minOrderAmount: BigInt(item.minOrderAmount.toString()),
            decimals: Number(item.decimals),
            isUSD: item.isUSD,
        }));
    }
    /**
     * Get metadata of a specific token.
     * If already cached, return from this.tokens.
     * Otherwise, fetch from contract and cache it.
     *
     * @param tokenAddress The address of the token.
     * @returns Promise resolving to TokenInfo or undefined if fetch fails.
     */
    async getTokenInfo(tokenAddress) {
        const key = tokenAddress.toLowerCase();
        // Return from cache if available
        if (this.tokensInfo[key]) {
            return this.tokensInfo[key];
        }
        // validate input
        if (!isAddress(tokenAddress)) {
            throw new Error(`Invalid token address: ${tokenAddress}`);
        }
        try {
            const infos = await this.getTokensInfo([tokenAddress]);
            if (infos.length === 1) {
                this.tokensInfo[key] = infos[0];
                return infos[0];
            }
        }
        catch (err) {
            console.error("Failed to fetch token info:", err);
        }
        return {};
    }
    /**
     * Fetch all unique token addresses that are listed in any market.
     * This includes both base and quote tokens.
     * @returns A Promise resolving to an array of unique token addresses.
     */
    async getAllTokens() {
        const rawMarkets = await this.contract.getAllMarkets();
        const tokenSet = new Set();
        for (const m of rawMarkets) {
            tokenSet.add(m.baseAddress.toLowerCase());
            tokenSet.add(m.quoteAddress.toLowerCase());
        }
        return Array.from(tokenSet);
    }
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
    async getAllTokensInfo() {
        const tokenAddresses = await this.getAllTokens();
        const tokensInfo = await this.getTokensInfo(tokenAddresses);
        const result = {};
        for (const info of tokensInfo) {
            result[info.tokenAddress.toLowerCase()] = info;
        }
        this.tokensInfo = result; // cache the result
        return result;
    }
}
//# sourceMappingURL=tokens.js.map