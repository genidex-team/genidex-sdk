
import { BigNumberish, Contract, ContractTransactionResponse, getBigInt, Signer, TransactionReceipt, TransactionResponse, ZeroAddress } from 'ethers';
import { GeniDex } from '../genidex/genidex.js';
import { MarketMap, Orders, OutputOrder, CancelOrderParams, OrderParams } from '../types.js';
import { utils } from '../utils.js';
import EventEmitter from 'events';

export interface OrderLog {
    marketId: bigint,
    trader: string;
    orderIndex: bigint;
    price: bigint;
    quantity: bigint;
    remainingQuantity: bigint,
    lastPrice: bigint,
    referrer: string,
    userID: bigint;
    blockNumber: bigint;
}

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
        console.log('events')
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
    }

    async start(){
        await this.loadMarkets();
        await this.loadBuyOrders();
        await this.loadSellOrders();
        if(this.sellOrders[1] && this.sellOrders[1][0]) console.log(this.sellOrders[1][0])
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

    parseEventOrder(...args: Array<any>): OrderLog{
        const eventLog = args[args.length - 1];
        const log: OrderLog = utils.parseLog(eventLog) as OrderLog;
        console.log(log);
        // log.blockNumber = eventLog.log.blockNumber;
        return {...log, blockNumber: eventLog.log.blockNumber};
    }

    onPlaceBuyOrder() {
        this.contract.on("OnPlaceBuyOrder", (...args
            /*marketId, trader, orderIndex,
            price, quantity, remainingQuantity,
            lastPrice, referrer, userID, eventLog*/
        ) => {
            // utils.parseLog()
            // console.log(args)
            const log = this.parseEventOrder(...args);
            const order: OutputOrder = {
                id:         log.orderIndex,
                trader:     log.trader,
                price:      log.price,
                quantity:   log.quantity,
                userID:     log.userID,
                blockNumber: log.blockNumber
            }
            const strMarketId = log.marketId.toString();
            const orderIndex = Number(log.orderIndex);
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
