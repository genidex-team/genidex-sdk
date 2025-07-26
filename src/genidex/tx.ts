import { Contract, Overrides, ErrorDescription, Interface, JsonRpcProvider, TransactionDescription, TransactionReceipt, TransactionResponse, LogDescription, Log } from "ethers";
import { GeniDex } from "./genidex.js";
import { WaitOpts } from "../types.js";
import { utils } from "../utils.js";

export class Tx {
    genidex!: GeniDex;
    contract: Contract;
    abi: any;
    iface: Interface;

    constructor(_genidex: GeniDex) {
        this.genidex = _genidex;
        this.abi = this.genidex.abi;
        this.contract = this.genidex.contract;
        this.iface = new Interface(this.abi);
    }

    async wait(txHash: string | undefined, opts: WaitOpts = {}): Promise<TransactionReceipt | undefined>{
        let {
            confirmations = 1,
            timeoutMs = 120_000,
            pollMs = 1_000,
            onProgress
        } = opts;
        const provider = this.genidex.provider;
        if(!txHash) return;
        const tx = await provider.getTransaction(txHash);
        // console.log(tx)
        if (!tx) {
            throw new Error(`Transaction not found: ${txHash}`);
        }
        // log(decode)
        while (true) {
            const receipt = await provider.getTransactionReceipt(tx.hash);
            // console.log('receipt', receipt)
            if(receipt){
                if (receipt.status === 0) {
                    await this.handleFailedTx(tx, receipt);
                }
                const currentBlock = await provider.getBlockNumber();
                const confNow = currentBlock - receipt.blockNumber + 1;
                // Enough confirmations?  ➜  resolve with the receipt
                if (confNow >= confirmations) return receipt;
            }
            // Detect dropped / replaced transactions
            const mempoolTx = await provider.getTransaction(tx.hash);
            if (!mempoolTx && !receipt) {
                const error = new Error("Transaction was dropped or replaced without a receipt") as any;
                error.code = "TRANSACTION_REPLACED";
                error.tx = tx;
                const decodedTx = this.decodeTx(tx);
                if(decodedTx){
                    error.invocation = {
                        method: decodedTx.name,
                        signature: decodedTx.signature,
                        args: decodedTx.args,
                        // overrides: this.extractOverrides(tx),
                        message: utils.errorDescriptionToString(decodedTx)
                    }
                }
                throw error;
            }
            await new Promise((r) => setTimeout(r, pollMs));
            if(pollMs < 60_000){
                pollMs += pollMs*2;
            }
            // log(pollMs);
        }
    }

    async findTxByNonce(address: string, nonce: number): Promise<TransactionResponse|undefined> {
        const provider = this.genidex.provider as JsonRpcProvider;
        const latest = await provider.getBlockNumber();
        const minBlock = latest - 5;

        for (let i = latest; i >= minBlock; i--) {
            const block = await provider.getBlock(i, true);
            const tx = block?.prefetchedTransactions.find(
                (tx) => tx.from.toLowerCase() === address.toLowerCase() && tx.nonce === nonce
            );
            if (tx) {
                // console.log("Found:", tx.hash);
                return tx;
            }
        }
        // console.log("Transaction not found");
    }

    async handleFailedTx(tx: TransactionResponse, receipt: TransactionReceipt){
        const provider = this.genidex.provider;
        const decodedTx = this.decodeTx(tx);
        try{
            await provider.call({
                ...tx,
                blockTag: receipt.blockNumber
            });
        }catch(error: any){
            error.tx = tx;
            error.receipt = receipt;
            // await this.revertError(error, functionName, args);
            const decodedError = this.decodeError(error);
            // log(decodedError);
            if(decodedError){
                error.reason = utils.errorDescriptionToString(decodedError)
                error.revert =  {
                    name: decodedError.name,
                    signature: decodedError.signature,
                    args: decodedError.args,
                    message: utils.errorDescriptionToString(decodedError)
                }
            }
            // console.log(decodedTx);
            if(decodedTx){
                error.invocation = {
                    method: decodedTx.name,
                    signature: decodedTx.signature,
                    args: decodedTx.args,
                    // overrides: this.extractOverrides(tx),
                    message: utils.errorDescriptionToString(decodedTx)
                }

            }
            throw error
        }
    }

    decodeTx(tx: TransactionResponse): TransactionDescription{
        // if(!tx) return;
        const decoded = this.iface.parseTransaction({
            data: tx.data,
            value: tx.value,
        });
        if (!decoded) {
            throw new Error("Failed to decode transaction.");
        }
        return decoded;
    }

    decodeLogs(logs: readonly Log[]){
        const decodedEvents = [];
        for (const log of logs) {
            try {
                const parsed = this.iface.parseLog(log);
                if(!parsed) return;
                const decodedEvent: any = {
                    name: parsed.name,
                    signature: parsed.signature,
                    args: parsed.args,
                    argsObject: this.argsLogToObject(parsed),
                    logIndex: log.index,
                    transactionHash: log.transactionHash,
                    address: log.address,
                }
                decodedEvents.push(decodedEvent);
            } catch (e) {
                continue;
            }
        }

        return decodedEvents;
    }

    decodeError(error: any): ErrorDescription | null{
        if(!error.data || error.data == '0x') return null;
        // log(error);
        const decoded = this.iface.parseError(error.data)
        return decoded;
    }

    argsLogToObject(parsed: LogDescription): Record<string, any> {
        const obj: Record<string, any> = {};

        parsed.fragment.inputs.forEach((input, index) => {
            const key = input.name && input.name.length ? input.name : index.toString();
            obj[key] = parsed.args[index];
        });

        return obj;
    }

}
