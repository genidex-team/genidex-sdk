import { BigNumberish } from 'ethers';
import { GeniDexCore } from './genidex.core';
import { Balances } from './balances';
import { BuyOrders } from './buy.orders';
import { Market } from "../types";
import { SellOrders } from './sell.orders';
import { Tokens } from './tokens';
export declare class GeniDex extends GeniDexCore {
    provider: any;
    address: string;
    tokens: Tokens;
    balances: Balances;
    buyOrders: BuyOrders;
    sellOrders: SellOrders;
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
}
