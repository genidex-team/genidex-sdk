import { BigNumberish, Contract, ContractTransactionResponse, ErrorDescription, Interface, JsonRpcProvider, Signer, TransactionReceipt, TransactionResponse, WebSocketProvider, TransactionRequest } from 'ethers';
import { Markets } from './markets';
import { Balances } from './balances';
import { BuyOrders } from './buy.orders';
import { OutputOrder, NetworkConfig, NetworkName, GeniDexTransactionResponse, WaitOpts } from "../types";
import { SellOrders } from './sell.orders';
import { Tokens } from './tokens';
import { Tx } from './tx';
type writeContractParams = {
    signer: Signer;
    method: string;
    args?: any[];
    overrides?: TransactionRequest;
};
/**
 * @group GeniDex
 */
export declare class GeniDex {
    abi: any;
    iface: Interface;
    network: NetworkConfig;
    contract: Contract;
    provider: WebSocketProvider | JsonRpcProvider;
    address: string;
    markets: Markets;
    tokens: Tokens;
    balances: Balances;
    buyOrders: BuyOrders;
    sellOrders: SellOrders;
    tx: Tx;
    private verifiedProvider;
    private verifiedContract;
    constructor();
    connect(networkName: NetworkName | string, provider: WebSocketProvider | JsonRpcProvider): Promise<void>;
    /**
     * Verifies that the provider is connected to the expected chain ID from this.network
     * @throws if the chain ID does not match
     */
    verifyProviderNetwork(networkName: NetworkName | string, provider: any): Promise<boolean>;
    /**
     * Returns a new contract instance using the provided signer.
     * If no signer is passed, it falls back to the provider (read-only).
     *
     * @param signer - Optional signer for sending transactions.
     * @returns A new Contract instance connected with signer or provider.
     */
    getContract(signer?: Signer): Contract;
    /**
     * Calculate fee based on normalized amount.
     *
     * Formula: fee = normAmount / 1000n (0.1%)
     *
     * @param normAmount - The normalized amount (18 decimals), as bigint or string.
     * @returns Fee amount (also in 18 decimals), as bigint.
     */
    calculateFee(normAmount: bigint | string): bigint;
    /**
     * Returns IDs of buy orders that have been fully filled (quantity == 0).
     *
     * @param orders - Array of orders (OutputOrder[])
     * @returns Array of filled order IDs (bigint[])
     */
    getFilledOrderIDs(orders: OutputOrder[]): bigint[];
    /**
     * Selects sell order IDs (sorted ascending by price) such that
     * the cumulative quantity exceeds or equals the requested normQuantity.
     *
     * @param sortedOrders - Array of orders sorted by price ascending
     * @param normQuantity - Maximum total quantity needed
     * @returns Array of order IDs
     */
    getMatchingOrderIds(sortedOrders: OutputOrder[], normQuantity: BigNumberish): BigNumberish[];
    writeContract({ signer, method, args, overrides }: writeContractParams): Promise<GeniDexTransactionResponse | undefined>;
    readContract(method: string, args?: any[]): Promise<any>;
    /**
     * Verifies that the given signer is connected to the same network as this.network.chainId
     * @param signer - The signer to verify
     * @throws if chainId mismatch
     */
    verifySignerNetwork(signer: Signer): Promise<void>;
    waitForConfirms1(tx: TransactionResponse, confirmations: number, method: string, args?: any[]): Promise<TransactionReceipt | undefined>;
    /**
     * Wait for a transaction hash with richer control than tx.wait().
     * Throws if the tx is dropped/replaced, if it reverts, or if the timeout elapses.
    */
    waitForConfirms(tx: ContractTransactionResponse, functionName: string, args?: any[], overrides?: {}, opts?: WaitOpts): Promise<TransactionReceipt>;
    verifyContractExists(): Promise<boolean | void>;
    /**
     * Decode a revert error thrown by a failed contract transaction.
     *
     * @param err - The caught error object (usually from try/catch around tx).
     * @returns A formatted string with the error name and arguments, or undefined if cannot decode.
     */
    decodeRevertError(err: unknown): ErrorDescription | undefined;
    /**
     * Handle and re-throw a contract revert error with decoded context.
     *
     * This function attempts to decode the revert reason from a caught error
     * using `this.decodeRevertError()`. If decoding is successful, it logs
     * and throws a formatted error with the decoded reason. If decoding fails,
     * it logs the raw error and throws a generic fallback message.
     *
     * @param err - The error object caught from a failed contract transaction.
     * @throws An Error containing the decoded or fallback message.
     */
    revertError(err: any, functionName: string, args?: any[], overrides?: {}): Promise<void>;
    /**
     * Map an array of contract call arguments to an object using ABI parameter names.
     *
     * @param methodName - The name of the function in the ABI.
     * @param args - Positional arguments array (must match ABI order).
     * @returns Object mapping parameter names to values.
     */
    mapArgsToObject(methodName: string, args: any[]): Record<string, any>;
    verifyMethodExists(contract: Contract, method: string): void;
    verifyStaticCallSucceeds(contract: Contract, method: string, args: any[], overrides?: any): Promise<void>;
    pause(signer: Signer): Promise<GeniDexTransactionResponse | undefined>;
    unpause(signer: Signer): Promise<GeniDexTransactionResponse | undefined>;
}
export {};
