import { ethers, Provider, BigNumberish, toBigInt, formatUnits } from "ethers";
import { constants } from "./constants";

export class Utils{

  /**
   * Get on-chain balance of a user's ETH or ERC20 token.
   * @param provider - Ethers provider instance
   * @param userAddress - Address of the user
   * @param tokenAddress - ETH_ADDRESS or ERC20 token address
   * @returns Balance as bigint
   */
  async getNormBalance(
    provider: Provider,
    userAddress: string,
    tokenAddress: string,
    decimals: number
  ): Promise<bigint> {
    if (tokenAddress === constants.ETH_ADDRESS) {
      // Native ETH balance
      return await provider.getBalance(userAddress);
    } else {
      // ERC20 balance
      const abi = ["function balanceOf(address) view returns (uint256)"];
      const contract = new ethers.Contract(tokenAddress, abi, provider);
      const rawBalance: bigint = await contract.balanceOf(userAddress);
      const normBalance: bigint = this.toNormAmount(rawBalance, decimals);
      return normBalance;
    }
  }

  /**
   * Convert token amount between different decimals.
   *
   * @param amount - Token amount in source decimals (as bigint or string).
   * @param fromDecimals - Source decimals (e.g. 6 for USDC).
   * @param toDecimals - Target decimals (e.g. 18 for normalized).
   * @returns Converted amount as bigint.
   */
  convertDecimals(
    amount: bigint | string | BigNumberish,
    fromDecimals: number,
    toDecimals: number
  ): bigint {
    const value = typeof amount === "bigint" ? amount : BigInt(amount);
    if (fromDecimals === toDecimals) return value;
    const diff = toDecimals - fromDecimals;
    if (diff > 0) {
      return value * 10n ** BigInt(diff); // scale up
    } else {
      return value / 10n ** BigInt(-diff); // scale down
    }
  }

  /**
   * Converts an amount from the token's original decimals to the standard 18 decimals.
   *
   * @param rawAmount - The original amount (can be bigint, string, or BigNumberish).
   * @param tokenDecimals - The number of decimals the token uses (e.g., 6, 8, 18).
   * @returns The normalized amount as a bigint, scaled to 18 decimals.
   */
  toNormAmount(
    rawAmount: bigint | string | BigNumberish,
    tokenDecimals: number
  ): bigint {
    return this.convertDecimals(rawAmount, tokenDecimals, 18);
  }

  /**
   * Converts a normalized amount (18 decimals) back to the token's original decimals.
   *
   * @param normAmount - The normalized amount (can be bigint, string, or BigNumberish).
   * @param tokenDecimals - The target decimals of the token.
   * @returns The raw amount as a bigint, scaled to the token's decimals.
   */
  toRawAmount(
    normAmount: bigint | string | BigNumberish,
    tokenDecimals: number
  ): bigint {
    return this.convertDecimals(normAmount, 18, tokenDecimals);
  }

  /**
   * Format a normalized amount (with 18 decimals) into a human-readable string with commas.
   *
   * @param normAmount - The normalized amount (as `string`, `number`, or `bigint`).
   * @returns A formatted string with comma separators and fixed 18 decimal places.
   *
   * @example
   * formatNormAmount(1234567890000000000000n)
   * // => "1,234.567890000000000000"
   */
  formatNormAmount(normAmount: string | number | bigint): string {
    const amount = typeof normAmount === 'bigint' ? normAmount : toBigInt(normAmount);
    const formatted = formatUnits(amount, 18); // returns a string
    let [intPart, decPart = ''] = formatted.split('.');
    decPart = decPart.padEnd(18, '0').slice(0, 18);
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${intPart}.${decPart}`;
  }
}

export const utils = new Utils;