import { BigNumberish, Contract,
    ContractTransactionResponse,
    ErrorDescription, getBigInt, Interface, JsonRpcProvider, Network,
    Provider, Signer, TransactionReceipt, TransactionResponse, 
    WebSocketProvider, parseUnits,
    ContractTransactionReceipt, TransactionRequest,
    Result} from 'ethers';
import { abi } from '../../../genidex_contract/artifacts/contracts/GeniDex.sol/GeniDex.json';
import { Markets } from './markets';
import { Balances } from './balances';
import { BuyOrders } from './buy.orders';
import { TokenInfo, Market, OutputOrder, NetworkConfig, NetworkName, GeniDexTransactionResponse, WaitOpts } from "../types";
import { SellOrders } from './sell.orders';
import { Tokens } from './tokens';
import { IERC20Errors } from './abis/ierc20.errors';
import {config} from '../config/config';
import { Tx } from './tx';
import { utils } from "../utils";

type writeContractParams = {
    signer: Signer;
    method: string;
    args?: any[];
    overrides?: TransactionRequest
}

/**
 * @group GeniDex
 */
export class GeniDex {
    public abi: any;
    public iface!: Interface;
    public network!: NetworkConfig;
    public contract!: Contract;
    public provider!: WebSocketProvider | JsonRpcProvider;
    public address!: string;
    public markets!: Markets;
    public tokens!: Tokens;
    public balances!: Balances;
    public buyOrders!: BuyOrders;
    public sellOrders!: SellOrders;
    public tx!: Tx;
    private verifiedProvider = false;
    private verifiedContract = false;

    constructor() {
    }

    async connect(
        networkName: NetworkName | string,
        provider: WebSocketProvider | JsonRpcProvider
    ){
        await this.verifyProviderNetwork(networkName, provider);
        this.abi        = abi;
        this.iface      = new Interface(this.abi);
        this.provider   = provider;
        this.network    = config.getNetwork(networkName);
        this.address    = this.network.contracts.GeniDex;
        this.contract   = new Contract(this.address, abi, provider);
        this.markets    = new Markets(this);
        this.tokens     = new Tokens(this);
        this.balances   = new Balances(this);
        this.buyOrders  = new BuyOrders(this);
        this.sellOrders = new SellOrders(this);
        this.tx         = new Tx(this);
    }

    /**
     * Verifies that the provider is connected to the expected chain ID from this.network
     * @throws if the chain ID does not match
     */
    async verifyProviderNetwork(networkName: NetworkName | string, provider: any): Promise<boolean> {
        if(this.verifiedProvider) return true;
        const network = config.getNetwork(networkName)

        const currentNetwork = await provider.getNetwork();
        const currentChainId = currentNetwork.chainId;
        if (currentChainId !== network.chainId) {
            throw new Error(
                `Chain ID mismatch: expected ${network.chainId}, got ${currentChainId}`
            );
        }
        this.verifiedProvider = true;
        return true;
        // console.log('verified ProviderNetwork')
    }

    /**
     * Returns a new contract instance using the provided signer.
     * If no signer is passed, it falls back to the provider (read-only).
     *
     * @param signer - Optional signer for sending transactions.
     * @returns A new Contract instance connected with signer or provider.
     */
    getContract(signer?: Signer): Contract {
        const runner = signer ?? this.provider;
        return new Contract(this.address, this.abi, runner);
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

    async writeContract({
        signer,
        method,
        args = [],
        overrides = {}
    }: writeContractParams ): Promise<GeniDexTransactionResponse | undefined> {
        const contract = new Contract(this.address, this.abi, signer);
        this.verifyMethodExists(contract, method);
        await Promise.all([
            this.verifyContractExists(),
            this.verifySignerNetwork(signer),
            this.verifyStaticCallSucceeds(contract, method, args, overrides)
        ]);
        try {
            // const tx = await contract[method](...args, overrides);
            const tx = await contract.getFunction(method).send(...args, overrides);
            (tx as GeniDexTransactionResponse).waitForConfirms = async (): Promise<TransactionReceipt | undefined>=>{
                return await this.waitForConfirms(tx, method, args, overrides, {});
                // return await this.waitForConfirms1(tx, 1, method, args);
            };
            return (tx as GeniDexTransactionResponse);
        } catch (error) {
            await this.revertError(error, method, args, overrides);
        }
    }

    async readContract(
        method: string,
        args: any[] = []
    ): Promise<any> {
        try {
            this.verifyMethodExists(this.contract, method);
            const result = await this.contract[method](...args);
            return result;
        } catch (err) {
            await this.verifyContractExists();
            // console.error(`readContract: Error calling "${method}"`, err);
            throw err;
        }
    }

    /**
     * Verifies that the given signer is connected to the same network as this.network.chainId
     * @param signer - The signer to verify
     * @throws if chainId mismatch
     */
    async verifySignerNetwork(signer: Signer): Promise<void> {
        if (!signer.provider) return;

        const signerChainId = (await signer.provider.getNetwork()).chainId;
        if (signerChainId !== this.network.chainId) {
            throw new Error(
                `Chain ID mismatch: expected ${this.network.chainId}, got ${signerChainId}`
            );
        }
        // console.log('verified SignerNetwork')
    }

    async waitForConfirms1(
        tx: TransactionResponse,
        confirmations: number,
        method: string,
        args: any[] = []
    ): Promise<TransactionReceipt | undefined> {
        try {
            const receipt = await tx.wait(confirmations);
            // const receipt = await this.provider.waitForTransaction(tx.hash);
            if (receipt?.status === 1) {
                return receipt;
            } else {
                throw new Error(`Transaction reverted on-chain: ${tx.hash}`);
            }
        } catch (error: any) {
            try{
                await this.provider.call({
                    ...tx,
                    blockTag: error.receipt.blockNumber
                });
                // console.log('rawData', rawData);
            }catch(error2: any){
                // console.log('error2')
                error2.receipt = error.receipt;
                await this.revertError(error2, method, args);
            }
            await this.revertError(error, method, args);
        }
    }

    /**
     * Wait for a transaction hash with richer control than tx.wait().
     * Throws if the tx is dropped/replaced, if it reverts, or if the timeout elapses.
    */
    async waitForConfirms(
        tx: ContractTransactionResponse,
        functionName: string,
        args?: any[],
        overrides?: {},
        opts: WaitOpts = {},
    ) {
        let {
            confirmations = 1,
            timeoutMs = 120_000,
            pollMs = 1_000,
            onProgress
        } = opts;

        const provider = this.provider;
        const started = Date.now();

        while (true) {
            // Try to fetch the mined receipt
            const receipt = await provider.getTransactionReceipt(tx.hash);
            console.log('=================',receipt);

            if (receipt) {
                // If mined but reverted (status === 0) → obtain and decode revert data
                if (receipt.status === 0) {
                    try{
                        await provider.call({
                            ...tx,
                            blockTag: receipt.blockNumber
                        });
                    }catch(error: any){
                        error.receipt = receipt;
                        await this.revertError(error, functionName, args, overrides);
                    }
                }

                // Count confirmations
                const currentBlock = await provider.getBlockNumber();
                const confNow = currentBlock - receipt.blockNumber + 1;

                if (onProgress) onProgress(confNow);

                // Enough confirmations?  ➜  resolve with the receipt
                if (confNow >= confirmations) return receipt;
            }

            // Abort if we have exceeded the timeout
            if (Date.now() - started > timeoutMs) {
                throw new Error(`Transaction still pending after ${timeoutMs} ms`);
            }

            // Detect dropped / replaced transactions
            const mempoolTx = await provider.getTransaction(tx.hash);
            if (!mempoolTx && !receipt) {
                throw new Error("Transaction was dropped or replaced without a receipt");
            }

            // Sleep before the next poll
            if(pollMs < 60_000){
                pollMs += pollMs*20/100;
            }
            await new Promise((r) => setTimeout(r, pollMs));
        }
    }

    async verifyContractExists(): Promise<boolean | void> {
        if(this.verifiedContract) return true;
        const code = await this.provider.getCode(this.address);
        if (code === '0x') {
            const message = `❌ Contract not found at ${this.address} on the ${this.network.name} network`;
            throw new Error(message);
        }
        this.verifiedContract = true;
        return true;
    }

    /**
     * Decode a revert error thrown by a failed contract transaction.
     *
     * @param err - The caught error object (usually from try/catch around tx).
     * @returns A formatted string with the error name and arguments, or undefined if cannot decode.
     */
    decodeRevertError(err: unknown): ErrorDescription | undefined {
        if ( typeof err !== "object" || err === null || !("data" in err) ) {
            return;
        }

        const data = (err as { data?: string }).data;
        if (!data || typeof data !== "string") return;

        try {
            const interfaces = [
                new Interface(this.abi),
                new Interface(IERC20Errors),
            ];
            for (const iface of interfaces) {
                try {
                    const parsed: null | ErrorDescription = iface.parseError(data);
                    if (parsed) {
                        return parsed;
                    }
                } catch (_) {
                    continue;
                }
            }
        } catch (decodeErr) {
            return;
        }
    }

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
    async revertError(err: any, functionName: string, args?: any[], overrides?:{}) {
        // if(err.code == 'CALL_EXCEPTION'){
            const fn = this.iface.getFunction(functionName);
            if(fn){
                let invocation = new ErrorDescription(fn, fn?.selector, args as Result);
                // err.invocation = utils.errorDescriptionToString(invocation);
                err.invocation = {
                    name: invocation.name,
                    signature: invocation.signature,
                    args: invocation.args,
                    selector: invocation.selector,
                    message: utils.errorDescriptionToString(invocation),
                    overrides
                };
            }
            const decodedError = this.decodeRevertError(err);
            if(decodedError){
                err.reason = utils.errorDescriptionToString(decodedError);
                // err.revert = utils.errorDescriptionToString(decodedError);
                err.revert = {
                    name: decodedError.name,
                    signature: decodedError.signature,
                    args: decodedError.args,
                    selector: decodedError.selector,
                    message: utils.errorDescriptionToString(decodedError)
                };
            }
            err.message = utils.jsonToString(err);
        // }
        throw err;
    }

    /**
     * Map an array of contract call arguments to an object using ABI parameter names.
     *
     * @param methodName - The name of the function in the ABI.
     * @param args - Positional arguments array (must match ABI order).
     * @returns Object mapping parameter names to values.
     */
    mapArgsToObject(methodName: string, args: any[]): Record<string, any> {
        const iface = new Interface(this.abi);
        const fn = iface.getFunction(methodName);
        console.log(fn);
        if (fn?.inputs.length !== args.length) {
            throw new Error(`Argument count mismatch for ${methodName}`);
        }
        const result: Record<string, any> = {};
        fn.inputs.forEach((input, index) => {
            result[input.name] = args[index];
        });
        return result;
    }

    verifyMethodExists(contract: Contract, method: string) {
        if (typeof contract[method] !== "function") {
            throw new Error(`Method "${method}" does not exist on the contract.`);
        }
    }

    async verifyStaticCallSucceeds(
        contract: Contract,
        method: string,
        args: any[],
        overrides: any = {}
    ) {
        try {
            await contract.getFunction(method).staticCall(...args, overrides);
        } catch (error: any) {
            await this.revertError(error, method, args, overrides);
        }
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