import { BigNumberish, Contract, Signer, TransactionResponse } from 'ethers';
import { GeniDex } from './genidex';
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
    depositEth(signer: Signer, normAmount: BigNumberish): Promise<TransactionResponse | undefined>;
    /**
     * Withdraw native ETH from the DEX contract to the user's wallet.
     *
     * This sends a transaction to the contract's `withdrawEth(uint256)` function.
     * The contract should transfer ETH back to msg.sender if they have sufficient balance.
     *
     * @param normAmount - The amount of ETH to withdraw, in wei (bigint or compatible BigNumberish).
     * @returns Promise that resolves once the transaction is confirmed.
     */
    withdrawEth(signer: Signer, normAmount: BigNumberish): Promise<TransactionResponse | undefined>;
    /**
     * Deposit a token into the DEX contract using a normalized amount (18 decimals).
     *
     * @param tokenAddress - Address of the ERC20 token.
     * @param normAmount - Token amount in 18 decimals (as bigint or string).
     */
    depositToken(signer: Signer, tokenAddress: string, normAmount: BigNumberish, normApproveAmount: BigNumberish): Promise<TransactionResponse | undefined>;
    /**
     * Calls the withdrawToken function from the GeniDex contract.
     *
     * @param signer - Signer to send the transaction
     * @param tokenAddress - Address of the token to withdraw
     * @param normalizedAmount - Amount in normalized (18-decimal) format
     */
    withdrawToken(signer: Signer, tokenAddress: string, normAmount: BigNumberish): Promise<TransactionResponse | undefined>;
    /**
     * Get the deposited balance of a token.
     *
     * @param accountAddress
     * @param tokenAddress - The ERC20 token address to query.
     * @returns Promise resolving to the deposited token balance (as bigint).
     */
    getTokenBalance(accountAddress: string, tokenAddress: string): Promise<bigint>;
}
