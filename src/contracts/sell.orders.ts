
import { BigNumberish, Contract, Signer, TransactionResponse, ZeroAddress } from 'ethers';
import { GeniDex } from './genidex';
import { OutputOrder, orderParams } from '../types';

export class SellOrders {
    genidex!: GeniDex;
    contract: Contract;

    constructor(_genidex: GeniDex) {
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
    }

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
     * @param params.waitForConfirm - Optional. Whether to wait for tx confirmation.
     * @returns TransactionResponse or receipt if `waitForConfirm` is true.
     */
    async placeSellOrder({
        signer,
        marketId,
        normPrice,
        normQuantity,
        referrer = ZeroAddress,
        overrides = {}
    }: orderParams): Promise<TransactionResponse|undefined> {
        const buyOrders = this.genidex.buyOrders;
        const buyOrderIds = await buyOrders.getMatchingBuyOrderIds(marketId, normPrice, normQuantity);
        const filledSellOrderId = await this.randomFilledSellOrderID(marketId);
        // console.log(sellOrders);
        const args = [
            marketId,
            normPrice,
            normQuantity,
            filledSellOrderId,
            buyOrderIds,
            referrer
        ]
        const method = 'placeSellOrder';
        return await this.genidex.writeContract({signer, method, args, overrides});
    }

    /**
     * Returns a random ID of a buy order that has been fully filled (quantity == 0).
     *
     * @param marketId - ID of the market
     * @returns Random filled order ID (bigint) or null if none found
     */
    async randomFilledSellOrderID(marketId: BigNumberish): Promise<bigint | null> {
        const marketSellOrders = await this.getMarketSellOrders(marketId);
        const filledSellOrderIDs = this.genidex.getFilledOrderIDs(marketSellOrders);
        const random = Math.floor(Math.random() * filledSellOrderIDs.length);
        const filledSellOrderId = filledSellOrderIDs[random];
        return filledSellOrderId || 0n;
    }

    /**
     * Fetch list of sell orders for a market.
     *
     * @param marketId - ID of the market
     * @returns Array of matching OutputOrder objects
     */
    async getMarketSellOrders(marketId: BigNumberish): Promise<OutputOrder[]> {
        const rawOrders = await this.contract["getSellOrders(uint256)"](marketId);
        // console.log(rawOrders);
        return rawOrders.map((o: any, index: number) => ({
            id: BigInt(index.toString()),
            trader: o.trader,
            price: BigInt(o.price.toString()),
            quantity: BigInt(o.quantity.toString()),
        }));
    }

    /**
     * Fetch list of sell orders for a market with price <= maxPrice.
     *
     * @param marketId - ID of the market
     * @param maxPrice - Max acceptable price (normalized to 18 decimals)
     * @returns Array of matching OutputOrder objects
     */
    async getSellOrders(marketId: BigNumberish, maxPrice: BigNumberish): Promise<OutputOrder[]> {
        const rawOrders = await this.contract["getSellOrders(uint256,uint256)"](marketId, maxPrice);
        return rawOrders.map((o: any) => ({
            id: BigInt(o.id.toString()),
            trader: o.trader,
            price: BigInt(o.price.toString()),
            quantity: BigInt(o.quantity.toString()),
        }));
    }

    /**
     * Sorts an array of sell orders by price ascending (low to high).
     * @param orders - Array of sell orders
     * @returns Sorted array
     */
    sortSellOrders(orders: OutputOrder[]): OutputOrder[] {
        return [...orders].sort((a, b) => {
            if (a.price < b.price) return -1;
            if (a.price > b.price) return 1;
            return 0;
        });
    }

    /**
     * Get a list of sell order IDs that can match a buy order based on price and quantity.
     * @param marketId - The ID of the market to query.
     * @param normPrice - The maximum buy price (normalized to 18 decimals).
     * @param normQuantity - The desired buy quantity (normalized to 18 decimals).
     * @returns An array of matching sell order IDs, ordered by best price.
     */
    async getMatchingSellOrderIds(
        marketId: BigNumberish,
        normPrice: BigNumberish,
        normQuantity: BigNumberish
    ){
        const sellOrders: OutputOrder[] = await this.getSellOrders(marketId, normPrice);
        const sortedSellOrders: OutputOrder[] = this.sortSellOrders(sellOrders);
        const sellOrderIds = this.genidex.getMatchingOrderIds(sortedSellOrders, normQuantity);
        return sellOrderIds;
    }

    /**
     * Cancel a sell order on the specified market.
     *
     * @param signer - The signer (wallet) performing the cancellation.
     * @param marketId - The ID of the market where the sell order exists.
     * @param orderIndex - The index of the sell order to cancel.
     * @returns The transaction response object.
     */
    async cancelSellOrder(
        signer: Signer,
        marketId: BigNumberish,
        orderIndex: BigNumberish,
        waitForConfirm?: boolean
    ): Promise<TransactionResponse | undefined> {
        const contract = this.genidex.getContract(signer);
        const args = [marketId, orderIndex]
        try{
            const tx = await contract.cancelSellOrder(...args);
            return waitForConfirm ? await tx.wait() : tx;
        }catch(error){
            await this.genidex.revertError(error, 'cancelSellOrder', args);
        }
    }

}