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
    async depositEth({ signer, normAmount, overrides = {} }) {
        if (!normAmount || BigInt(normAmount) <= 0n) {
            throw new Error("normAmount must be > 0");
        }
        const value = BigInt(normAmount);
        if (value <= 0n) {
            throw new Error("ETH amount must be greater than zero");
        }
        const tx = await this.genidex.writeContract({
            signer,
            method: "depositEth",
            overrides: {
                ...overrides,
                value,
            }
        });
        return tx;
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
    async withdrawEth({ signer, normAmount, overrides = {} }) {
        if (BigInt(normAmount) <= 0n) {
            throw new Error("Withdrawal amount must be greater than zero");
        }
        const args = [
            normAmount
        ];
        return await this.genidex.writeContract({
            signer,
            method: "withdrawEth",
            args,
            overrides
        });
    }
    /**
     * Deposits a specified ERC20 token into the GeniDex contract using a normalized amount with 18 decimals.
     *
     * @param signer - The Signer instance used to sign the transaction.
     * @param tokenAddress - The address of the ERC20 token to deposit.
     * @param normAmount - The deposit amount, normalized to 18 decimals (as bigint or string).
     * @param normApproveAmount - The amount to approve for transfer, also in 18 decimals.
     * @returns A Promise that resolves to the transaction response if the deposit is initiated, or undefined otherwise.
     */
    async depositToken({ signer, tokenAddress, normAmount, normApproveAmount, overrides = {} }) {
        if (!normAmount || BigInt(normAmount) <= 0n) {
            throw new Error("normAmount must be > 0");
        }
        const erc20 = new ERC20(tokenAddress, this.genidex.provider);
        const token = await this.genidex.tokens.getTokenInfo(tokenAddress);
        const { decimals } = token;
        const rawAmount = utils.toRawAmount(normAmount, decimals);
        // Approve if needed
        const rawAllowance = await erc20.allowance(signer.getAddress(), this.genidex.address);
        if (rawAllowance < rawAmount) {
            const rawApproveAmount = utils.toRawAmount(normApproveAmount, decimals);
            await erc20.approve(signer, this.genidex.address, rawApproveAmount);
        }
        // Call depositToken(normalizedAmount)
        const args = [
            tokenAddress,
            normAmount
        ];
        return await this.genidex.writeContract({
            signer,
            method: "depositToken",
            args,
            overrides
        });
    }
    /**
     * Calls the withdrawToken function from the GeniDex contract.
     *
     * @param signer - Signer to send the transaction
     * @param tokenAddress - Address of the token to withdraw
     * @param normAmount - Amount in normalized (18-decimal) format
     */
    async withdrawToken({ signer, tokenAddress, normAmount, overrides = {} }) {
        const args = [
            tokenAddress,
            normAmount
        ];
        const method = 'withdrawToken';
        return await this.genidex.writeContract({ signer, method, args, overrides });
    }
    /**
     * Get the balance of accountAddress on GeniDex.
     *
     * @param accountAddress
     * @param tokenOrEtherAddress - Token address or ETH_ADDRESS (0x0).
     * @returns Promise resolving to the deposited balance (as bigint), normalized to 18 decimals.
     */
    async getBalance(accountAddress, tokenOrEtherAddress) {
        const args = [accountAddress, tokenOrEtherAddress];
        const normAmount = await this.genidex.readContract('balances', args);
        return normAmount;
    }
}
//# sourceMappingURL=balances.js.map