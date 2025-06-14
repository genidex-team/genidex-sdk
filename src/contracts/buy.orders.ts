
import { BigNumberish, Contract, ContractTransactionResponse, getBigInt, Signer, TransactionReceipt, TransactionResponse, ZeroAddress } from 'ethers';
import { GeniDex } from './genidex';
import { OutputOrder, orderParams } from '../types';



/**
 * @group Contracts
 */
export class BuyOrders {
    genidex!: GeniDex;
    contract: Contract;

    constructor(_genidex: GeniDex) {
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
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
    async placeBuyOrder({
        signer, marketId,
        normPrice, normQuantity,
        referrer = ZeroAddress,
        overrides = {}
    }: orderParams ): Promise<ContractTransactionResponse | undefined> {
        const sellOrderIds = await this.genidex.sellOrders.getMatchingSellOrderIds(
            marketId,
            normPrice,
            normQuantity
        );
        const filledBuyOrderId = await this.randomFilledBuyOrderID(marketId);
        const args = [
            marketId,
            normPrice,
            normQuantity,
            filledBuyOrderId,
            sellOrderIds,
            referrer,
        ];

        const method = 'placeBuyOrder';
        return await this.genidex.writeContract({signer, method, args, overrides});
    }

    /**
     * Fetch list of buy orders for a market with price <= maxPrice.
     *
     * @param marketId - ID of the market
     * @param maxPrice - Max acceptable price (normalized to 18 decimals)
     * @returns Array of matching OutputOrder objects
     */
    async getBuyOrders(marketId: BigNumberish, maxPrice: BigNumberish): Promise<OutputOrder[]> {
        const rawOrders = await this.contract["getBuyOrders(uint256,uint256)"](marketId, maxPrice);
        return rawOrders.map((o: any) => ({
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
    sortBuyOrders(orders: OutputOrder[]): OutputOrder[] {
        return [...orders].sort((a, b) => {
            if (a.price < b.price) return 1;
            if (a.price > b.price) return -1;
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
    getBuyOrderIds(sortedBuyOrders: OutputOrder[], normQuantity: BigNumberish): BigNumberish[] {
        const selectedIds: BigNumberish[] = [];
        let total = 0n;
        const target = getBigInt(normQuantity);
        for (const order of sortedBuyOrders) {
            if (total >= target) break;
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
    async getMarketBuyOrders(marketId: BigNumberish): Promise<OutputOrder[]> {
        const rawOrders = await this.contract["getBuyOrders(uint256)"](marketId);
        // console.log(rawOrders);
        return rawOrders.map((o: any, index: number) => ({
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
    async randomFilledBuyOrderID(marketId: BigNumberish): Promise<bigint | null> {
        const marketBuyOrders = await this.getMarketBuyOrders(marketId);
        const filledBuyOrderIDs = this.genidex.getFilledOrderIDs(marketBuyOrders);
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
    async getMatchingBuyOrderIds(
        marketId: BigNumberish,
        normPrice: BigNumberish,
        normQuantity: BigNumberish
    ) {
        const sellOrders: OutputOrder[] = await this.getBuyOrders(marketId, normPrice);
        const sortedBuyOrders: OutputOrder[] = this.sortBuyOrders(sellOrders);
        const buyOrderIds = this.genidex.getMatchingOrderIds(sortedBuyOrders, normQuantity);
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
    async cancelBuyOrder(
        signer: Signer,
        marketId: BigNumberish,
        orderIndex: BigNumberish,
        waitForConfirm?: boolean
    ): Promise<TransactionResponse | undefined> {
        const contract = this.genidex.getContract(signer);
        const args = [marketId, orderIndex];
        try{
            const tx = await contract.cancelBuyOrder(...args);
            return waitForConfirm ? await tx.wait() : tx;
        }catch(error){
            await this.genidex.revertError(error, 'cancelBuyOrder', args);
        }
    }

}
