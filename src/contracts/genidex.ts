import { BigNumberish, Contract,
    ContractTransactionResponse,
    ErrorDescription, getBigInt, Interface, JsonRpcProvider, Network,
    Provider, Signer, TransactionReceipt, TransactionResponse, 
    WebSocketProvider, parseUnits,
    ContractTransactionReceipt} from 'ethers';
import { abi } from '../../../genidex_contract/artifacts/contracts/GeniDex.sol/GeniDex.json';
import { Markets } from './markets';
import { Balances } from './balances';
import { BuyOrders } from './buy.orders';
import { TokenInfo, Market, OutputOrder, NetworkConfig, NetworkName, GeniDexTransactionResponse } from "../types";
import { SellOrders } from './sell.orders';
import { Tokens } from './tokens';
import { IERC20Errors } from './abis/ierc20.errors';
import {config} from '../config/config';

interface WaitOpts {
  /** How many confirmations before resolving (default: 1) */
  confirmations?: number;
  /** Abort if the receipt is not found within this period, in ms (default: 120 000) */
  timeoutMs?: number;
  /** Polling interval, in ms (default: 4 000) */
  pollMs?: number;
  /** Optional progress hook called every time a new confirmation is observed */
  onProgress?: (currentConf: number) => void;
}

/**
 * @group GeniDex
 */
export class GeniDex {
    public abi: any;
    public network!: NetworkConfig;
    public contract!: Contract;
    public provider!: WebSocketProvider | JsonRpcProvider | Provider;
    public address!: string;
    public markets!: Markets;
    public tokens!: Tokens;
    public balances!: Balances;
    public buyOrders!: BuyOrders;
    public sellOrders!: SellOrders;
    private verifiedProvider = false;
    private verifiedContract = false;

    constructor() {
    }

    async connect(
        networkName: NetworkName,
        provider: WebSocketProvider | JsonRpcProvider | Provider
    ){
        await this.verifyProviderNetwork(networkName, provider);
        this.abi        = abi;
        this.provider   = provider;
        this.network    = config.getNetwork(networkName);
        this.address    = this.network.contracts.GeniDex;
        this.contract   = new Contract(this.address, abi, provider);
        this.markets    = new Markets(this);
        this.tokens     = new Tokens(this);
        this.balances   = new Balances(this);
        this.buyOrders  = new BuyOrders(this);
        this.sellOrders = new SellOrders(this);
    }

    /**
     * Verifies that the provider is connected to the expected chain ID from this.network
     * @throws if the chain ID does not match
     */
    async verifyProviderNetwork(networkName: NetworkName, provider: any): Promise<boolean> {
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

    async writeContract(
        signer: Signer,
        method: string,
        args: any[] = [],
        overrides: Record<string, any> = {},
        waitForConfirm: boolean = false
    ): Promise<GeniDexTransactionResponse | undefined> {
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
            (tx as GeniDexTransactionResponse).waitForConfirms = async (): Promise<TransactionReceipt>=>{
                return await this.waitForConfirms(tx, method, args, {});
            };
            return (tx as GeniDexTransactionResponse);
        } catch (error) {
            await this.revertError(error, method, args);
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
    ) {
        try {
            const receipt = await tx.wait(confirmations);
            if (receipt?.status === 1) {
                return receipt;
            } else {
                throw new Error(`Transaction reverted on-chain: ${tx.hash}`);
            }
        } catch (error: any) {
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
        opts: WaitOpts = {},
    ) {
        const {
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

            if (receipt) {
                // If mined but reverted (status === 0) → obtain and decode revert data
                if (receipt.status === 0) {
                    // Attempt to read revert bytes directly from the receipt object
                    let rawData = (receipt as any).data;

                    // console.log('rawData', receipt);
                    // If the node did not include revert data, replay the tx at its block
                    if (!rawData) {
                        // console.log(tx);
                        try{
                            rawData = await provider.call({
                                ...tx,
                                blockTag: receipt.blockNumber
                            });
                        }catch(error: any){
                            error.receipt = receipt;
                            this.revertError(error, functionName, args);
                        }
                    }
                    throw new Error( this.decodeRevertError(receipt) );
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
    decodeRevertError(err: unknown): string | undefined {
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
                        const args = parsed.args?.map((a) => a.toString()).join(", ");
                        return `${parsed.name}(${args})`;
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
    async revertError(err: any, functionName: string, args?: any[]) {
        if(err.code == 'CALL_EXCEPTION' && err.revert == null){
            let invocation = {
                method: functionName,
                args: {}
            };
            if(args){
                const argsObj = this.mapArgsToObject(functionName, args);
                invocation.args = argsObj;
            }
            err.invocation = invocation;
            err.revert = this.decodeRevertError(err);
        }
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
        overrides: any
    ) {
        try {
            await contract.getFunction(method).staticCall(...args, overrides);
        } catch (error: any) {
            await this.revertError(error, method, args);
        }
    }

    async pause(signer: Signer){
        const overrides = {
            gasPrice: parseUnits('300', 'gwei')
        }
        return await this.writeContract(signer, 'pause', [], overrides);
    }

    async unpause(signer: Signer){
        const overrides = {
            gasPrice: parseUnits('300', 'gwei')
        }
        return await this.writeContract(signer, 'unpause', [], overrides);
    }

}