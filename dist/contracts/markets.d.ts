import { BigNumberish, Contract } from 'ethers';
import { GeniDex } from './genidex';
import { Market } from '../types';
export declare class Markets {
    genidex: GeniDex;
    contract: Contract;
    constructor(_genidex: GeniDex);
    /**
     * Fetch all existing markets and return them as an object indexed by market ID.
     * @returns A Promise resolving to a record of markets keyed by market ID.
     */
    getAllMarkets(): Promise<Record<string, Market> | undefined>;
    /**
     * Fetch a single market by ID from the GeniDex contract.
     *
     * @param marketId - The ID of the market to fetch.
     * @returns A Promise resolving to a Market object.
     */
    getMarket(marketId: BigNumberish): Promise<Market>;
}
