import { BigNumberish, Contract, Signer, TransactionResponse } from 'ethers';
import { GeniDex } from './GeniDex';
import { OutputOrder } from '../types';
export declare class BuyOrders {
    core: GeniDex;
    contract: Contract;
    constructor(_core: GeniDex);
    /**
     * Place a buy order on the specified market.
     *
     * This function:
     * 1. Fetches matching sell order IDs for the given market and price.
     * 2. Randomly selects a filled buy order ID (if applicable).
     * 3. Submits a `placeBuyOrder` transaction with all parameters.
     *
     * @param params - Object containing all order parameters.
     * @param params.signer - Signer used to send the transaction.
     * @param params.marketId - ID of the market (e.g. 1).
     * @param params.normPrice - Price per unit (normalized to 18 decimals).
     * @param params.normQuantity - Quantity to buy (base token, 18 decimals).
     * @param params.referrer - Referral address (or zero address).
     * @param params.waitForConfirm - If true, waits for tx confirmation.
     * @returns TransactionResponse or receipt if `waitForConfirm` is true.
     */
    placeBuyOrder({ signer, marketId, normPrice, normQuantity, referrer, waitForConfirm }: {
        signer: Signer;
        marketId: BigNumberish;
        normPrice: BigNumberish;
        normQuantity: BigNumberish;
        referrer: string;
        waitForConfirm?: boolean;
    }): Promise<TransactionResponse | undefined>;
    /**
     * Fetch list of buy orders for a market with price <= maxPrice.
     *
     * @param marketId - ID of the market
     * @param maxPrice - Max acceptable price (normalized to 18 decimals)
     * @returns Array of matching OutputOrder objects
     */
    getBuyOrders(marketId: BigNumberish, maxPrice: BigNumberish): Promise<OutputOrder[]>;
    /**
     * Sorts an array of sell orders by price descending (high to low).
     * @param orders - Array of sell orders
     * @returns Sorted array
     */
    sortBuyOrders(orders: OutputOrder[]): OutputOrder[];
    /**
     * Selects buy order IDs (sorted ascending by price) such that
     * the cumulative quantity exceeds or equals the requested normQuantity.
     *
     * @param sortedBuyOrders - Array of sell orders sorted by price ascending
     * @param normQuantity - Maximum total quantity needed
     * @returns Array of order IDs
     */
    getBuyOrderIds(sortedBuyOrders: OutputOrder[], normQuantity: BigNumberish): BigNumberish[];
    /**
     * Fetch list of buy orders for a market.
     *
     * @param marketId - ID of the market
     * @returns Array of matching OutputOrder objects
     */
    getMarketBuyOrders(marketId: BigNumberish): Promise<OutputOrder[]>;
    /**
     * Returns a random ID of a buy order that has been fully filled (quantity == 0).
     *
     * @param marketId - ID of the market
     * @returns Random filled order ID (bigint) or null if none found
     */
    randomFilledBuyOrderID(marketId: BigNumberish): Promise<bigint | null>;
    /**
     * Get a list of buy order IDs that can match a sell order based on price and quantity.
     *
     * @param marketId - The market identifier.
     * @param normPrice - The normalized minimum acceptable price (18 decimals).
     * @param normQuantity - The normalized quantity to sell (18 decimals).
     * @returns An array of matching buy order IDs, sorted by best price first.
     */
    getMatchingBuyOrderIds(marketId: BigNumberish, normPrice: BigNumberish, normQuantity: BigNumberish): Promise<BigNumberish[]>;
    /**
     * Cancel a buy order on the specified market.
     *
     * @param signer - The signer (wallet) performing the cancellation.
     * @param marketId - The ID of the market where the buy order exists.
     * @param orderIndex - The index of the buy order to cancel.
     * @returns The transaction response object.
     */
    cancelBuyOrder(signer: Signer, marketId: BigNumberish, orderIndex: BigNumberish, waitForConfirm?: boolean): Promise<TransactionResponse | undefined>;
}
