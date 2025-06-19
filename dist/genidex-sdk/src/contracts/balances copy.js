import { Contract } from 'ethers';
import { ERC20 } from './erc20';
import { utils } from '../utils';
export class Balances {
    constructor(_genidex) {
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
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
    async depositEth(signer, normAmount) {
        if (!normAmount || BigInt(normAmount) <= 0n) {
            throw new Error("normAmount must be > 0");
        }
        const value = BigInt(normAmount);
        if (value <= 0n) {
            throw new Error("ETH amount must be greater than zero");
        }
        const contract = new Contract(this.genidex.address, this.genidex.abi, signer);
        try {
            const tx = await contract.depositEth({ value });
            return tx;
        }
        catch (error) {
            console.error({
                'functionName': 'depositEth',
                signer: await signer.getAddress(),
                value
            });
            this.genidex.revertError(error, "depositEth");
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
    async withdrawEth(signer, normAmount) {
        if (BigInt(normAmount) <= 0n) {
            throw new Error("Withdrawal amount must be greater than zero");
        }
        const contract = new Contract(this.genidex.address, this.genidex.abi, signer);
        try {
            const tx = await contract.withdrawEth(normAmount);
            return tx;
        }
        catch (error) {
            console.error({
                'functionName': 'withdrawEth',
                signer: await signer.getAddress(),
                normAmount
            });
            this.genidex.revertError(error, "withdrawEth");
        }
    }
    /**
     * Deposit a token into the DEX contract using a normalized amount (18 decimals).
     *
     * @param tokenAddress - Address of the ERC20 token.
     * @param normAmount - Token amount in 18 decimals (as bigint or string).
     */
    async depositToken(signer, tokenAddress, normAmount, normApproveAmount) {
        if (!normAmount || BigInt(normAmount) <= 0n) {
            throw new Error("normalizedAmount must be > 0");
        }
        const erc20 = new ERC20(tokenAddress, signer);
        const token = await this.genidex.tokens.getTokenInfo(tokenAddress);
        const { decimals } = token;
        const rawAmount = utils.toRawAmount(normAmount, decimals);
        // Approve if needed
        const rawAllowance = await erc20.allowance(signer.getAddress(), this.genidex.address);
        if (rawAllowance < rawAmount) {
            const rawApproveAmount = utils.toRawAmount(normApproveAmount, decimals);
            await erc20.approve(this.genidex.address, rawApproveAmount);
        }
        // Call depositToken(normalizedAmount)
        const contract = new Contract(this.genidex.address, this.genidex.abi, signer);
        try {
            const tx = await contract.depositToken(tokenAddress, normAmount);
            return tx;
        }
        catch (error) {
            console.error({
                'functionName': 'depositToken',
                signer: await signer.getAddress(),
                tokenAddress,
                normAmount
            });
            this.genidex.revertError(error, "depositToken");
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
    async withdrawToken(signer, tokenAddress, normAmount) {
        try {
            const contract = new Contract(this.genidex.address, this.genidex.abi, signer);
            const tx = await contract.withdrawToken(tokenAddress, normAmount);
            return tx;
        }
        catch (error) {
            console.error({
                'functionName': 'withdrawToken',
                signer: await signer.getAddress(),
                tokenAddress,
                normAmount
            });
            this.genidex.revertError(error, "withdrawToken");
        }
    }
    /**
     * Get the deposited balance of a token.
     *
     * @param accountAddress
     * @param tokenAddress - The ERC20 token address to query.
     * @returns Promise resolving to the deposited token balance (as bigint).
     */
    async getTokenBalance(accountAddress, tokenAddress) {
        const normAmount = await this.contract.balances(accountAddress, tokenAddress);
        return normAmount;
    }
}
//# sourceMappingURL=balances%20copy.js.map