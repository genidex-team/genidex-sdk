
import { BigNumberish, Contract, ContractTransactionResponse, getBigInt, Signer, TransactionReceipt, TransactionResponse, ZeroAddress } from 'ethers';
import { GeniDex } from './genidex';
import { MarketMap, Orders, OutputOrder, cancelOrderParams, orderParams } from '../types';
import EventEmitter from 'events';

export type SDKEvents = {
  buyOrderPlaced: (data: OutputOrder) => void;
};

/**
 * @group Contracts
 */
export class Events extends EventEmitter {
    genidex!: GeniDex;
    contract: Contract;
    buyOrders: Orders = {};
    sellOrders: Orders = {};
    markets: MarketMap = {}

    constructor(_genidex: GeniDex) {
        super();
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
    }

    async start(){
        await this.loadMarkets();
        await this.loadBuyOrders();
        await this.loadSellOrders();
        console.log(this.sellOrders[1][0])
        this.onPlaceBuyOrder();
    }

    async loadMarkets(){
        this.markets = await this.genidex.markets.getAllMarkets();
        const length = Object.keys(this.markets).length;
        console.log({'markets.length': length})
    }

    async loadBuyOrders(){
        for (const marketId in this.markets) {
            this.buyOrders[marketId] = await this.genidex.buyOrders.getAllBuyOrders(marketId);
            console.log({
                marketId,
                'buyOrders.length': this.buyOrders[marketId].length
            })
        }
    }

    async loadSellOrders(){
        for (const marketId in this.markets) {
            this.sellOrders[marketId] = await this.genidex.sellOrders.getAllSellOrders(marketId);
            console.log({
                marketId,
                'sellOrders.length': this.sellOrders[marketId].length
            })
        }
    }

    onPlaceBuyOrder() {
        this.contract.on("OnPlaceBuyOrder", (
            marketId, trader, orderIndex,
            price, quantity, remainingQuantity,
            lastPrice, referrer, eventLog
        ) => {
            const order: OutputOrder = {
                id: BigInt(orderIndex.toString()),
                trader: trader,
                price: BigInt(price.toString()),
                quantity: BigInt(quantity.toString()),
                blockNumber: eventLog.log.blockNumber
            }
            const strMarketId = marketId.toString();
            this.buyOrders[strMarketId][orderIndex] = order;
            // console.log(order);
            this.emit("buyOrderPlaced", order);
            // console.log(eventLog);
            // callback(event);
        });
    }

    emit<K extends keyof SDKEvents>(event: K, ...args: Parameters<SDKEvents[K]>): boolean {
        return super.emit(event, ...args);
    }

    on<K extends keyof SDKEvents>(event: K, listener: SDKEvents[K]): this {
        return super.on(event, listener);
    }

    once<K extends keyof SDKEvents>(event: K, listener: SDKEvents[K]): this {
        return super.once(event, listener);
    }

    off<K extends keyof SDKEvents>(event: K, listener: SDKEvents[K]): this {
        return super.off(event, listener);
    }

}
