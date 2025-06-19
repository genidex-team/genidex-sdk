export class Markets {
    constructor(_genidex) {
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
    }
    /**
     * Fetch all existing markets and return them as an object indexed by market ID.
     * @returns A Promise resolving to a record of markets keyed by market ID.
     */
    async getAllMarkets() {
        try {
            const rawMarkets = await this.genidex.readContract('getAllMarkets');
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
        catch (error) {
            await this.genidex.revertError(error, 'getAllMarkets');
        }
    }
    /**
     * Fetch a single market by ID from the GeniDex contract.
     *
     * @param marketId - The ID of the market to fetch.
     * @returns A Promise resolving to a Market object.
     */
    async getMarket(marketId) {
        const raw = await this.genidex.readContract('getMarket', [marketId]);
        return {
            id: BigInt(raw.id.toString()),
            symbol: raw.symbol,
            price: BigInt(raw.price.toString()),
            lastUpdatePrice: BigInt(raw.lastUpdatePrice.toString()),
            baseAddress: raw.baseAddress,
            quoteAddress: raw.quoteAddress,
            creator: raw.creator,
            isRewardable: raw.isRewardable
        };
    }
}
//# sourceMappingURL=markets.js.map