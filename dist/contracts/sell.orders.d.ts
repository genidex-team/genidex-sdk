import { BigNumberish, Contract, TransactionResponse } from 'ethers';
import { GeniDex } from './genidex';
import { OutputOrder, cancelOrderParams, orderParams } from '../types';
export declare class SellOrders {
    genidex: GeniDex;
    contract: Contract;
    constructor(_genidex: GeniDex);
    /**
     * Place a sell order on the specified market.
     *
     * This function:
     * 1. Fetches matching buy order IDs based on price and quantity.
     * 2. Randomly selects a filled sell order ID if applicable.
     * 3. Sends a `placeSellOrder` transaction with the required parameters.
     *
     * @param params - Object containing order parameters.
     * @param params.signer - Signer used to send the transaction.
     * @param params.marketId - ID of the market (e.g. 1).
     * @param params.normPrice - Price per unit (normalized to 18 decimals).
     * @param params.normQuantity - Quantity to sell (base token, 18 decimals).
     * @param params.referrer - Address of the referrer, or zero address.
     * @returns TransactionResponse.
     */
    placeSellOrder({ signer, marketId, normPrice, normQuantity, referrer, overrides }: orderParams): Promise<TransactionResponse | undefined>;
    /**
     * Cancel a sell order on the specified market.
     *
     * @param signer - The signer (wallet) performing the cancellation.
     * @param marketId - The ID of the market where the sell order exists.
     * @param orderIndex - The index of the sell order to cancel.
     * @returns The transaction response object.
     */
    cancelSellOrder({ signer, marketId, orderIndex, overrides }: cancelOrderParams): Promise<TransactionResponse | undefined>;
    getFilledSellOrderIds(marketId: BigNumberish, limit?: BigNumberish): Promise<bigint[]>;
    /**
     * Returns a random ID of a buy order that has been fully filled (quantity == 0).
     *
     * @param marketId - ID of the market
     * @returns Random filled order ID (bigint) or null if none found
     */
    randomFilledSellOrderID(marketId: BigNumberish): Promise<bigint | null>;
    getAllSellOrders(marketId: BigNumberish): Promise<{
        id: bigint;
        trader: any;
        price: bigint;
        quantity: bigint;
    }[]>;
    getSellOrdersLength(marketId: BigNumberish): Promise<bigint>;
    /**
     * Fetch list of sell orders for a market with price <= maxPrice.
     *
     * @param marketId - ID of the market
     * @param maxPrice - Max acceptable price (normalized to 18 decimals)
     * @returns Array of matching OutputOrder objects
     */
    getSellOrders(marketId: BigNumberish, maxPrice: BigNumberish): Promise<OutputOrder[]>;
    /**
     * Sorts an array of sell orders by price ascending (low to high).
     * @param orders - Array of sell orders
     * @returns Sorted array
     */
    sortSellOrders(orders: OutputOrder[]): OutputOrder[];
    /**
     * Get a list of sell order IDs that can match a buy order based on price and quantity.
     * @param marketId - The ID of the market to query.
     * @param normPrice - The maximum buy price (normalized to 18 decimals).
     * @param normQuantity - The desired buy quantity (normalized to 18 decimals).
     * @returns An array of matching sell order IDs, ordered by best price.
     */
    getMatchingSellOrderIds(marketId: BigNumberish, normPrice: BigNumberish, normQuantity: BigNumberish): Promise<BigNumberish[]>;
}
