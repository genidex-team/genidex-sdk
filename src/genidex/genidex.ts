import { BigNumberish, Contract,
    ContractTransactionResponse,
    ErrorDescription, getBigInt, Interface, JsonRpcProvider,
    Signer, TransactionReceipt, TransactionResponse,
    WebSocketProvider, TransactionRequest, Result,
    BrowserProvider
} from 'ethers';
import {BaseContract} from '../base/base.contract.js';
import {geniDexABI} from "../abis/genidex.abi.js";
import { Markets } from './markets.js';
import { Balances } from './balances.js';
import { BuyOrders } from './buy.orders.js';
import { OutputOrder, NetworkConfig, NetworkName, GeniDexTransactionResponse, WaitOpts, WriteContractParams } from "../types.js";
import { SellOrders } from './sell.orders.js';
import { Tokens } from './tokens.js';
import { IERC20Errors } from '../abis/ierc20.errors.js';
import {config} from '../config/config.js';
import { Tx } from './tx.js';
import { utils } from "../utils.js";



/**
 * @group GeniDex
 */
export class GeniDex extends BaseContract {
    public markets!: Markets;
    public tokens!: Tokens;
    public balances!: Balances;
    public buyOrders!: BuyOrders;
    public sellOrders!: SellOrders;
    public tx!: Tx;
    // public apiSocket: any;

    constructor() {
        super();
    }

    async connect(
        networkName: NetworkName | string,
        providerOrRpc: WebSocketProvider | JsonRpcProvider | BrowserProvider | string,
        apiSocket?: any
    ){
        let network    = config.getNetwork(networkName);
        let address    = network.contracts.GeniDex;
        await super.init(address, geniDexABI, networkName, providerOrRpc);

        this.markets    = new Markets(this);
        this.tokens     = new Tokens(this);
        this.balances   = new Balances(this);
        this.buyOrders  = new BuyOrders(this);
        this.sellOrders = new SellOrders(this);
        this.tx         = new Tx(this);
        this.apiSocket  = apiSocket;
    }

    async emit(event: any, data: any) {
        return new Promise((resolve) => {
            this.apiSocket.emit(event, data, (response: any) => {
                resolve(response);
            });
        });
    }

    /**
     * Calculate fee based on normalized amount.
     *
     * Formula: fee = normAmount / 1000n (0.1%)
     *
     * @param normAmount - The normalized amount (18 decimals), as bigint or string.
     * @returns Fee amount (also in 18 decimals), as bigint.
     */
    calculateFee(normAmount: bigint | string): bigint {
        const amount = typeof normAmount === "string" ? BigInt(normAmount) : normAmount;
        return amount / 1000n;
    }

    /**
     * Returns IDs of buy orders that have been fully filled (quantity == 0).
     *
     * @param orders - Array of orders (OutputOrder[])
     * @returns Array of filled order IDs (bigint[])
     */
    getFilledOrderIDs(orders: OutputOrder[]): bigint[] {
        return orders
            .filter(order => getBigInt(order.quantity) === 0n)
            .map(order => order.id);
    }

    /**
     * Selects sell order IDs (sorted ascending by price) such that
     * the cumulative quantity exceeds or equals the requested normQuantity.
     *
     * @param sortedOrders - Array of orders sorted by price ascending
     * @param normQuantity - Maximum total quantity needed
     * @returns Array of order IDs
     */
    getMatchingOrderIds(sortedOrders: OutputOrder[], normQuantity: BigNumberish): BigNumberish[] {
        const selectedIds: BigNumberish[] = [];
        let total = 0n;
        const target = getBigInt(normQuantity);

        for (const order of sortedOrders) {
            if (total >= target) break;

            selectedIds.push(order.id);
            total += order.quantity;
        }

        return selectedIds;
    }

    async pause(signer: Signer){
        const overrides = {
            // gasPrice: parseUnits('300', 'gwei')
        }
        return await this.writeContract({signer, method: 'pause', args:[], overrides});
    }

    async unpause(signer: Signer){
        const overrides = {
            // gasPrice: parseUnits('300', 'gwei')
        }
        return await this.writeContract({signer, method: 'unpause', args:[], overrides});
    }

}