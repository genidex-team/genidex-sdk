
import { BigNumberish, Contract, Signer, TransactionResponse } from 'ethers';
import { GeniDexCore } from './genidex.core';
import { ERC20 } from './erc20';
import { convertDecimals, toRawAmount } from '../utils';

export class Balances {
    core!: GeniDexCore;
    contract: Contract;

    constructor(_core: GeniDexCore) {
        this.core = _core;
        this.contract = this.core.contract;
    }

    /**
     * Deposit native ETH into the DEX contract.
     *
     * This sends a payable transaction to the contract's `depositEth()` function.
     * The ETH value must be greater than zero, and will be stored in the user's balance.
     *
     * @param normAmount - The amount of ETH to deposit, in wei (as bigint or string).
     * @returns Promise that resolves once the transaction is confirmed.
     */
    async depositEth(
        signer: Signer,
        normAmount: BigNumberish
    ): Promise<TransactionResponse | undefined> {
        if (!normAmount || BigInt(normAmount) <= 0n) {
            throw new Error("normAmount must be > 0");
        }
        const value = BigInt(normAmount);
        if (value <= 0n) {
            throw new Error("ETH amount must be greater than zero");
        }
        const contract = new Contract(this.core.address, this.core.abi, signer);
        try{
            const tx = await contract.depositEth({ value });
            return tx;
        }catch(error){
            console.error({
                'functionName': 'depositEth',
                signer: signer.getAddress(),
                value
            });
            this.core.revertError(error, "depositEth");
        }
    }

    /**
     * Withdraw native ETH from the DEX contract to the user's wallet.
     *
     * This sends a transaction to the contract's `withdrawEth(uint256)` function.
     * The contract should transfer ETH back to msg.sender if they have sufficient balance.
     *
     * @param normAmount - The amount of ETH to withdraw, in wei (bigint or compatible BigNumberish).
     * @returns Promise that resolves once the transaction is confirmed.
     */
    async withdrawEth(signer: Signer, normAmount: BigNumberish): Promise<TransactionResponse | undefined> {
        if (BigInt(normAmount) <= 0n) {
            throw new Error("Withdrawal amount must be greater than zero");
        }

        const contract = new Contract(this.core.address, this.core.abi, signer);
        try{
            const tx = await contract.withdrawEth(normAmount);
            return tx;
        }catch(error){
            console.error({
                'functionName': 'withdrawEth',
                signer: signer.getAddress(),
                normAmount
            });
            this.core.revertError(error, "withdrawEth");
        }
    }

    /**
     * Deposit a token into the DEX contract using a normalized amount (18 decimals).
     *
     * @param tokenAddress - Address of the ERC20 token.
     * @param normAmount - Token amount in 18 decimals (as bigint or string).
     */
    async depositToken(
        signer: Signer,
        tokenAddress: string,
        normAmount: BigNumberish,
        normApproveAmount: BigNumberish
    ): Promise<TransactionResponse | undefined>{
        if (!normAmount || BigInt(normAmount) <= 0n) {
            throw new Error("normalizedAmount must be > 0");
        }
        const erc20 = new ERC20(tokenAddress, signer);
        const token = await this.core.getTokenMeta(tokenAddress);
        const {decimals} = token;
        const rawAmount = toRawAmount(normAmount, decimals);
        // Approve if needed
        const rawAllowance = await erc20.allowance(signer.getAddress(), this.core.address);

        if (rawAllowance < rawAmount) {
            const rawApproveAmount = toRawAmount(normApproveAmount, decimals);
            await erc20.approve(this.core.address, rawApproveAmount);
        }
        // Call depositToken(normalizedAmount)
        const contract = new Contract(this.core.address, this.core.abi, signer);
        try {
            const tx = await contract.depositToken(tokenAddress, normAmount);
            return tx;
        }catch(error){
            console.error({
                'functionName': 'depositToken',
                signer: signer.getAddress(),
                tokenAddress,
                normAmount
            });
            this.core.revertError(error, "depositToken");
        }
        // console.log("Deposit tx sent:", tx.hash);
        // await tx.wait();
        
    }

    /**
     * Calls the withdrawToken function from the GeniDex contract.
     *
     * @param signer - Signer to send the transaction
     * @param tokenAddress - Address of the token to withdraw
     * @param normalizedAmount - Amount in normalized (18-decimal) format
     */
    async withdrawToken(
        signer: Signer,
        tokenAddress: string,
        normAmount: BigNumberish
    ): Promise<TransactionResponse | undefined> {

        try {
            const contract = new Contract(this.core.address, this.core.abi, signer);
            const tx = await contract.withdrawToken(tokenAddress, normAmount);
            return tx;
        } catch (error: any) {
            console.error({
                'functionName': 'withdrawToken',
                signer: signer.getAddress(),
                tokenAddress,
                normAmount
            });
            this.core.revertError(error, "withdrawToken");
        }
    }

    /**
     * Get the deposited balance of a token.
     *
     * @param accountAddress
     * @param tokenAddress - The ERC20 token address to query.
     * @returns Promise resolving to the deposited token balance (as bigint).
     */
    async getTokenBalance(accountAddress: string, tokenAddress: string): Promise<bigint> {
        const normAmount = await this.contract.balances(accountAddress, tokenAddress);
        return normAmount;
    }
}