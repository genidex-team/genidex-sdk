import { getBigInt } from 'ethers';
export class BuyOrders {
    constructor(_core) {
        this.core = _core;
        this.contract = this.core.contract;
    }
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
    async placeBuyOrder({ signer, marketId, normPrice, normQuantity, referrer, waitForConfirm = false }) {
        const sellOrderIds = await this.core.sellOrders.getMatchingSellOrderIds(marketId, normPrice, normQuantity);
        const filledBuyOrderId = await this.randomFilledBuyOrderID(marketId);
        const contract = this.core.getContract(signer);
        const args = [
            marketId,
            normPrice,
            normQuantity,
            filledBuyOrderId,
            sellOrderIds,
            referrer,
        ];
        try {
            const tx = await contract.placeBuyOrder(...args);
            return waitForConfirm ? await tx.wait() : tx;
            // const tx = await contract.getFunction("placeBuyOrder").staticCall(...args);
            // return tx;
        }
        catch (error) {
            this.core.revertError(error, "placeBuyOrder", args);
        }
    }
    /**
     * Fetch list of buy orders for a market with price <= maxPrice.
     *
     * @param marketId - ID of the market
     * @param maxPrice - Max acceptable price (normalized to 18 decimals)
     * @returns Array of matching OutputOrder objects
     */
    async getBuyOrders(marketId, maxPrice) {
        const rawOrders = await this.contract["getBuyOrders(uint256,uint256)"](marketId, maxPrice);
        return rawOrders.map((o) => ({
            id: BigInt(o.id.toString()),
            trader: o.trader,
            price: BigInt(o.price.toString()),
            quantity: BigInt(o.quantity.toString()),
        }));
    }
    /**
     * Sorts an array of sell orders by price descending (high to low).
     * @param orders - Array of sell orders
     * @returns Sorted array
     */
    sortBuyOrders(orders) {
        return [...orders].sort((a, b) => {
            if (a.price < b.price)
                return 1;
            if (a.price > b.price)
                return -1;
            return 0;
        });
    }
    /**
     * Selects buy order IDs (sorted ascending by price) such that
     * the cumulative quantity exceeds or equals the requested normQuantity.
     *
     * @param sortedBuyOrders - Array of sell orders sorted by price ascending
     * @param normQuantity - Maximum total quantity needed
     * @returns Array of order IDs
     */
    getBuyOrderIds(sortedBuyOrders, normQuantity) {
        const selectedIds = [];
        let total = 0n;
        const target = getBigInt(normQuantity);
        for (const order of sortedBuyOrders) {
            if (total >= target)
                break;
            selectedIds.push(order.id);
            total += order.quantity;
        }
        return selectedIds;
    }
    /**
     * Fetch list of buy orders for a market.
     *
     * @param marketId - ID of the market
     * @returns Array of matching OutputOrder objects
     */
    async getMarketBuyOrders(marketId) {
        const rawOrders = await this.contract["getBuyOrders(uint256)"](marketId);
        // console.log(rawOrders);
        return rawOrders.map((o, index) => ({
            id: BigInt(index.toString()),
            trader: o.trader,
            price: BigInt(o.price.toString()),
            quantity: BigInt(o.quantity.toString()),
        }));
    }
    /**
     * Returns a random ID of a buy order that has been fully filled (quantity == 0).
     *
     * @param marketId - ID of the market
     * @returns Random filled order ID (bigint) or null if none found
     */
    async randomFilledBuyOrderID(marketId) {
        const marketBuyOrders = await this.getMarketBuyOrders(marketId);
        const filledBuyOrderIDs = this.core.getFilledOrderIDs(marketBuyOrders);
        const random = Math.floor(Math.random() * filledBuyOrderIDs.length);
        const filledBuyOrderId = filledBuyOrderIDs[random];
        return filledBuyOrderId || 0n;
    }
    /**
     * Get a list of buy order IDs that can match a sell order based on price and quantity.
     *
     * @param marketId - The market identifier.
     * @param normPrice - The normalized minimum acceptable price (18 decimals).
     * @param normQuantity - The normalized quantity to sell (18 decimals).
     * @returns An array of matching buy order IDs, sorted by best price first.
     */
    async getMatchingBuyOrderIds(marketId, normPrice, normQuantity) {
        const sellOrders = await this.getBuyOrders(marketId, normPrice);
        const sortedBuyOrders = this.sortBuyOrders(sellOrders);
        const buyOrderIds = this.core.getMatchingOrderIds(sortedBuyOrders, normQuantity);
        return buyOrderIds;
    }
    /**
     * Cancel a buy order on the specified market.
     *
     * @param signer - The signer (wallet) performing the cancellation.
     * @param marketId - The ID of the market where the buy order exists.
     * @param orderIndex - The index of the buy order to cancel.
     * @returns The transaction response object.
     */
    async cancelBuyOrder(signer, marketId, orderIndex, waitForConfirm) {
        const contract = this.core.getContract(signer);
        const args = [marketId, orderIndex];
        try {
            const tx = await contract.cancelBuyOrder(...args);
            return waitForConfirm ? await tx.wait() : tx;
        }
        catch (error) {
            this.core.revertError(error, 'cancelBuyOrder', args);
        }
    }
}
// Object.assign(GeniDexCore.prototype, BuyOrders.prototype);
//# sourceMappingURL=buy.orders%20copy.js.map