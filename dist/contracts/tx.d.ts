import { Contract, ErrorDescription, Interface, TransactionDescription, TransactionReceipt, TransactionResponse, LogDescription, Log } from "ethers";
import { GeniDex } from "./genidex";
import { WaitOpts } from "../types";
export declare class Tx {
    genidex: GeniDex;
    contract: Contract;
    abi: any;
    iface: Interface;
    constructor(_genidex: GeniDex);
    wait(txHash: string | undefined, opts?: WaitOpts): Promise<TransactionReceipt | undefined>;
    findTxByNonce(address: string, nonce: number): Promise<TransactionResponse | undefined>;
    handleFailedTx(tx: TransactionResponse, receipt: TransactionReceipt): Promise<void>;
    decodeTx(tx: TransactionResponse): TransactionDescription;
    decodeLogs(logs: readonly Log[]): {
        name: string;
        signature: string;
        args: import("ethers").Result;
        argsObject: Record<string, any>;
        logIndex: number;
        transactionHash: string;
        address: string;
    }[] | undefined;
    decodeError(error: any): ErrorDescription | null;
    argsLogToObject(parsed: LogDescription): Record<string, any>;
}
