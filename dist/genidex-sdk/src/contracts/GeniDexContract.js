import { getAddress } from 'ethers';
import { GeniDexCore } from './genidex.core';
import { Balances } from './balances';
import { BuyOrders } from './buy.orders';
export class GeniDexContract extends GeniDexCore {
    // public buyOrders: BuyOrders;
    constructor(address, provider) {
        super(address, provider);
        this.tokens = {};
        this.provider = provider;
        this.address = getAddress(address);
        // this.contract = new Contract(this.address, abi, provider);
        this.balances = new Balances(this);
        this.buyOrders = new BuyOrders(this);
    }
    /*
    async depositEth(...args: [Signer, BigNumberish]): Promise<TransactionResponse>{
        return await this.balances.depositEth(...args);
    }

    async withdrawEth(...args: [Signer, BigNumberish]): Promise<TransactionResponse>{
        return await this.balances.withdrawEth(...args);
    }

    async withdrawToken(...args: [Signer, string, BigNumberish]): Promise<TransactionResponse>{
        return await this.balances.withdrawToken(...args);
    }

    async depositToken(...args: [Signer, string, BigNumberish, BigNumberish]): Promise<TransactionResponse>{
        return await this.balances.depositToken(...args);
    }*/
    /**
     * Fetch all existing markets and return them as an object indexed by market ID.
     * @returns A Promise resolving to a record of markets keyed by market ID.
     */
    async getAllMarkets() {
        const rawMarkets = await this.contract.getAllMarkets();
        const marketMap = {};
        for (const m of rawMarkets) {
            const id = BigInt(m.id).toString();
            marketMap[id] = {
                symbol: m.symbol,
                id: BigInt(m.id.toString()),
                price: BigInt(m.price.toString()),
                lastUpdatePrice: BigInt(m.lastUpdatePrice.toString()),
                baseAddress: m.baseAddress.toLowerCase(),
                quoteAddress: m.quoteAddress.toLowerCase(),
                creator: m.creator,
                isRewardable: m.isRewardable,
            };
        }
        return marketMap;
    }
    /**
     * Fetch a single market by ID from the GeniDex contract.
     *
     * @param marketId - The ID of the market to fetch.
     * @returns A Promise resolving to a Market object.
     */
    async getMarket(marketId) {
        const raw = await this.contract.getMarket(marketId);
        return {
            symbol: raw.symbol,
            id: BigInt(raw.id.toString()),
            price: BigInt(raw.price.toString()),
            lastUpdatePrice: BigInt(raw.lastUpdatePrice.toString()),
            baseAddress: raw.baseAddress,
            quoteAddress: raw.quoteAddress,
            creator: raw.creator,
            isRewardable: raw.isRewardable
        };
    }
    /**
     * Fetch all unique token addresses that are listed in any market.
     * This includes both base and quote tokens.
     * @returns A Promise resolving to an array of unique token addresses.
     */
    async getAllListedTokens() {
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
    async getAllListedTokenMeta() {
        // if (Object.keys(this.tokens).length > 0) {
        //     return this.tokens;
        // }
        const tokenAddresses = await this.getAllListedTokens();
        const tokenInfos = await this.getTokensInfo(tokenAddresses);
        const result = {};
        for (const info of tokenInfos) {
            result[info.tokenAddress.toLowerCase()] = info;
        }
        this.tokens = result; // cache the result
        return result;
    }
}
//# sourceMappingURL=GeniDexContract.js.map