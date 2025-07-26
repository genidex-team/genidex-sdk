
import { BigNumberish, Contract, getBigInt, Signer, TransactionResponse, ZeroAddress } from 'ethers';
import { GeniDex } from './genidex.js';
import { OutputOrder, CancelOrderParams, OrderParams } from '../types.js';
import { utils } from '../utils.js';

export class SellOrders {
    genidex!: GeniDex;
    contract: Contract;

    constructor(_genidex: GeniDex) {
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
    }

    async getSellOrderArgs(
        marketId: BigNumberish,
        normPrice: BigNumberish,
        normQuantity: BigNumberish
    ): Promise<{filledSellOrderID: any, matchingBuyOrderIds: any}>{
        let args: any = {};
        if(this.genidex.apiSocket){
            args = await this.genidex.emit('get-order-args', {
                network: this.genidex.network.name,
                type: 'sell',
                marketId: marketId.toString(),
                price: normPrice.toString(),
                quantity: normQuantity.toString()
            });
        }else{
            const openBuyOrders = await this.genidex.buyOrders.getOpenOrders(marketId);
            args.matchingBuyOrderIds = await this.genidex.buyOrders.getMatchingBuyOrderIds(
                openBuyOrders,
                normPrice,
                normQuantity
            );
            args.filledSellOrderID = await this.randomFilledSellOrderID(marketId);
        }
        console.log(args)
        return args as Promise<{filledSellOrderID: any, matchingBuyOrderIds: any}>;
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
     * @returns TransactionResponse.
     */
    async placeSellOrder({
        signer,
        marketId,
        normPrice,
        normQuantity,
        referrer = ZeroAddress,
        overrides = {}
    }: OrderParams): Promise<TransactionResponse|undefined> {
        // const buyOrders = this.genidex.buyOrders;
        // const buyOrderIds = await buyOrders.getMatchingBuyOrderIds(marketId, normPrice, normQuantity);
        // const filledSellOrderId = await this.randomFilledSellOrderID(marketId);
        // console.log(sellOrders);
        const {filledSellOrderID, matchingBuyOrderIds} = await this.getSellOrderArgs(
            marketId, normPrice, normQuantity
        )
        const args = [
            marketId,
            normPrice,
            normQuantity,
            filledSellOrderID,
            matchingBuyOrderIds,
            referrer
        ]
        const method = 'placeSellOrder';
        return await this.genidex.writeContract({signer, method, args, overrides});
    }

    /**
     * Cancel a sell order on the specified market.
     *
     * @param signer - The signer (wallet) performing the cancellation.
     * @param marketId - The ID of the market where the sell order exists.
     * @param orderIndex - The index of the sell order to cancel.
     * @returns The transaction response object.
     */
    async cancelSellOrder({
        signer,
        marketId,
        orderIndex,
        overrides = {}
    }: CancelOrderParams): Promise<TransactionResponse | undefined> {
        const args = [marketId, orderIndex];
        const method = 'cancelSellOrder';
        return await this.genidex.writeContract({signer, method, args, overrides});
    }

    async getFilledSellOrderIds(marketId: BigNumberish, limit: BigNumberish=1000) {
        const typeOrder = 1;// buy: 0, sell: 1
        const rawIds: bigint[] = await this.contract["getFilledOrders"](typeOrder, marketId, limit);
        // console.log(rawOrders);
        return rawIds.map(id => BigInt(id.toString()));
    }

    /**
     * Returns a random ID of a buy order that has been fully filled (quantity == 0).
     *
     * @param marketId - ID of the market
     * @returns Random filled order ID (bigint) or null if none found
     */
    async randomFilledSellOrderID(marketId: BigNumberish): Promise<bigint | null> {
        // const filledSellOrderIDs = this.genidex.getFilledOrderIDs(marketSellOrders);
        const filledSellOrderIDs = await this.getFilledSellOrderIds(marketId);
        const random = Math.floor(Math.random() * filledSellOrderIDs.length);
        const filledSellOrderId = filledSellOrderIDs[random];
        return filledSellOrderId || 0n;
    }

    async getAllSellOrders(marketId: BigNumberish): Promise<OutputOrder[]>{
        const rawOrders = [];
        const ordersTotal = await this.getSellOrdersLength(marketId);
        const pageSize = 3700;
        let offset = 0;

        const typeOrder = 1;// buy: 0, sell: 1
        while (offset < ordersTotal) {
            const page = await this.contract["getOrders"](typeOrder, marketId, offset, pageSize);
            offset += pageSize;
            rawOrders.push(...page);
        }
        // console.log(rawOrders);
        // return allOrders;
        return rawOrders.map((o: any, index: number) => ({
            id: BigInt(o.id.toString()),
            trader: o.trader,
            userID: BigInt(o.userID.toString()),
            price: BigInt(o.price.toString()),
            quantity: BigInt(o.quantity.toString()),
            blockNumber: null
        }));
    }

    async getOpenOrders(marketId: BigNumberish): Promise<OutputOrder[]>{
        const allOrders = await this.getAllSellOrders(marketId);
        const filteredOrders = allOrders.filter(order => order.quantity > 0n);
        return this.sortSellOrders(filteredOrders);
    }

    async getSellOrdersLength(marketId: BigNumberish): Promise<bigint> {
        const sellOrderLength = await this.contract["getSellOrdersLength"](marketId);
        return sellOrderLength;
    }

    /**
     * Fetch list of sell orders for a market with price <= maxPrice.
     *
     * @param marketId - ID of the market
     * @param maxPrice - Max acceptable price (normalized to 18 decimals)
     * @returns Array of matching OutputOrder objects
     */
    /*async getSellOrders(marketId: BigNumberish, maxPrice: BigNumberish, limit: BigNumberish=100): Promise<OutputOrder[]> {
        const rawOrders = await this.contract["getSellOrders"](marketId, maxPrice, limit);
        return rawOrders.map((o: any) => ({
            id: BigInt(o.id.toString()),
            trader: o.trader,
            price: BigInt(o.price.toString()),
            quantity: BigInt(o.quantity.toString()),
        }));
    }*/

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
        allSellOrders: OutputOrder[],
        normPrice: BigNumberish,
        normQuantity: BigNumberish
    ){
        const sortedSellOrders: OutputOrder[] = this.sortSellOrders(allSellOrders);
        // console.log({
        //     allSellOrders
        //     // sortedOrders: utils.formatOrders(sortedOrders)
        // })
        const sellOrderIds = this.filterSellOrderIds(sortedSellOrders, normPrice, normQuantity);
        return sellOrderIds;
    }

    filterSellOrderIds(
        sortedOrders: OutputOrder[],
        normPrice: BigNumberish,
        normQuantity: BigNumberish
    ): BigNumberish[] {
        const selectedIds: BigNumberish[] = [];
        let total = 0n;
        const buyQuantity = getBigInt(normQuantity);
        const buyPrice = getBigInt(normPrice);

        for (const sellOrder of sortedOrders) {
            if (sellOrder.price > buyPrice) break;
            if (sellOrder.quantity <= 0n ) continue;

            selectedIds.push(sellOrder.id);
            total += sellOrder.quantity;
            if (total >= buyQuantity) break;
        }

        return selectedIds;
    }

}