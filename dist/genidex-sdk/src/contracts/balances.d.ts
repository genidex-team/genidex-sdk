import { BigNumberish, Contract, Signer, TransactionReceipt, TransactionRequest, TransactionResponse } from 'ethers';
import { GeniDex } from './genidex';
import { GeniDexTransactionResponse } from '../types';
type depositEthParams = {
    signer: Signer;
    normAmount: BigNumberish;
    overrides?: TransactionRequest;
};
type withdrawEthParams = {
    signer: Signer;
    normAmount: BigNumberish;
    overrides?: TransactionRequest;
};
type depositTokenParams = {
    signer: Signer;
    tokenAddress: string;
    normAmount: BigNumberish;
    normApproveAmount: BigNumberish;
    overrides?: TransactionRequest;
};
type withdrawTokenParams = {
    signer: Signer;
    tokenAddress: string;
    normAmount: BigNumberish;
    overrides?: TransactionRequest;
};
export declare class Balances {
    genidex: GeniDex;
    contract: Contract;
    constructor(_genidex: GeniDex);
    /**
     * Deposit native ETH into the DEX contract.
     *
     * This sends a payable transaction to the contract's `depositEth()` function.
     * The ETH value must be greater than zero, and will be stored in the user's balance.
     *
     * @param normAmount - The amount of ETH to deposit, in wei (as bigint or string).
     * @returns Promise that resolves once the transaction is confirmed.
     */
    depositEth({ signer, normAmount, overrides }: depositEthParams): Promise<GeniDexTransactionResponse | undefined>;
    /**
     * Withdraw native ETH from the DEX contract to the user's wallet.
     *
     * This sends a transaction to the contract's `withdrawEth(uint256)` function.
     * The contract should transfer ETH back to msg.sender if they have sufficient balance.
     *
     * @param normAmount - The amount of ETH to withdraw, in wei (bigint or compatible BigNumberish).
     * @returns Promise that resolves once the transaction is confirmed.
     */
    withdrawEth({ signer, normAmount, overrides }: withdrawEthParams): Promise<GeniDexTransactionResponse | undefined>;
    /**
     * Deposits a specified ERC20 token into the GeniDex contract using a normalized amount with 18 decimals.
     *
     * @param signer - The Signer instance used to sign the transaction.
     * @param tokenAddress - The address of the ERC20 token to deposit.
     * @param normAmount - The deposit amount, normalized to 18 decimals (as bigint or string).
     * @param normApproveAmount - The amount to approve for transfer, also in 18 decimals.
     * @returns A Promise that resolves to the transaction response if the deposit is initiated, or undefined otherwise.
     */
    depositToken({ signer, tokenAddress, normAmount, normApproveAmount, overrides }: depositTokenParams): Promise<TransactionResponse | TransactionReceipt | undefined | null>;
    /**
     * Calls the withdrawToken function from the GeniDex contract.
     *
     * @param signer - Signer to send the transaction
     * @param tokenAddress - Address of the token to withdraw
     * @param normAmount - Amount in normalized (18-decimal) format
     */
    withdrawToken({ signer, tokenAddress, normAmount, overrides }: withdrawTokenParams): Promise<TransactionResponse | TransactionReceipt | undefined | null>;
    /**
     * Get the balance of accountAddress on GeniDex.
     *
     * @param accountAddress
     * @param tokenOrEtherAddress - Token address or ETH_ADDRESS (0x0).
     * @returns Promise resolving to the deposited balance (as bigint), normalized to 18 decimals.
     */
    getBalance(accountAddress: string, tokenOrEtherAddress: string): Promise<bigint>;
}
export {};
