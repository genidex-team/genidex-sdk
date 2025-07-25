import {LogDescription, EventLog, ethers, Provider, BigNumberish, toBigInt, formatUnits, ErrorDescription, formatEther, parseUnits } from "ethers";
import { constants } from "./constants";
import { OutputOrder } from "./types";

export class Utils{

  /**
   * Get on-chain balance of a user's ETH or ERC20 token.
   * @param provider - Ethers provider instance
   * @param userAddress - Address of the user
   * @param tokenAddress - ETH_ADDRESS or ERC20 token address
   * @returns Balance as bigint
   */
  async getBalanceInBaseUnit(
    provider: Provider,
    userAddress: string,
    tokenAddress: string,
    decimals: number
  ): Promise<bigint> {
    if (tokenAddress === constants.ETH_ADDRESS) {
      // Native ETH balance
      const rawBalance: bigint = await provider.getBalance(userAddress);
      const normBalance: bigint = this.toNormAmount(rawBalance, 18);
      return normBalance;
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
   * Get on-chain balance of a user's ETH.
   * @param provider - Ethers provider instance
   * @param userAddress - Address of the user
   * @returns Balance as bigint
   */
  async getETHBalanceInBaseUnit(
    provider: Provider,
    userAddress: string
  ): Promise<bigint> {
      const rawBalance: bigint = await provider.getBalance(userAddress);
      const normBalance: bigint = this.toNormAmount(rawBalance, 18);
      return normBalance;
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
      const diff = BigInt(toDecimals) - BigInt(fromDecimals);
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
    return this.convertDecimals(rawAmount, tokenDecimals, constants.GENIDEX_DECIMALS);
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
    return this.convertDecimals(normAmount, constants.GENIDEX_DECIMALS, tokenDecimals);
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
    const formatted = formatUnits(amount, constants.GENIDEX_DECIMALS); // returns a string
    let [intPart, decPart = ''] = formatted.split('.');
    decPart = decPart.padEnd(constants.GENIDEX_DECIMALS, '0').slice(0, constants.GENIDEX_DECIMALS);
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${intPart}.${decPart}`;
  }

  jsonToString(obj: any){
    return JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
  }

  bigintReplacer(key:any, value:any) {
    return typeof value === "bigint" ? value.toString() : value;
  }

  errorDescriptionToString(error: ErrorDescription){
    const errorFragment = error.fragment;
    const paramNames = errorFragment.inputs.map(input => input.name);
    const paramValues = error.args;

    const paramPairs = paramNames.map((name, index) => {
      const value = paramValues[index];
      let displayValue;
      if (typeof value === 'bigint') {
        displayValue = value;
      } else if (typeof value === 'object') {
        displayValue = JSON.stringify(value, this.bigintReplacer);
      } else {
        displayValue = String(value);
      }
      return `${name}: ${displayValue}`;
    });

    return `${error.name}(${paramPairs.join(', ')})`;
  }

  logError(error: any){
    console.error(error);
    const objError: any = {};
    for (const key in error) {
        objError[key] = error[key];
    }
    // console.error(objError);
    if(error.invocation && error.invocation.message) console.error('call:', error.invocation.message);
    if(error.reason) console.error('revert:', error.reason);
  }

  formatOrders(orders: OutputOrder[]) {
      return orders.map(order => ({
        id: order.id,
        trader: order.trader,
        price: utils.formatBaseUnit(order.price),
        quantity: utils.formatBaseUnit(order.quantity),
      })
    );
  }

  parseLog(log: EventLog | LogDescription): Record<string, any> {
    const result: Record<string, any> = {};

    if (!log.args || !log.fragment || !Array.isArray(log.args)) {
      return result;
    }

    const inputs = log.fragment.inputs;

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const value = log.args[i];
      result[input.name] = value;
    }

    return result;
  }

  parseBaseUnit(value: number | string){
      const strValue = value.toString();
      return parseUnits(strValue, constants.GENIDEX_DECIMALS);
  }

  formatBaseUnit(normValue: BigNumberish){
      const strValue = normValue.toString();
      return formatUnits(strValue, constants.GENIDEX_DECIMALS);
  }

  unixTime(): number {
    return Math.floor(Date.now() / 1000);
  }

  formatTimeDiff(startTime: bigint | number): { days: number, minutes: number, seconds: number } {
    const start = typeof startTime === 'bigint' ? Number(startTime) : startTime;
    const startDate = new Date(start * 1000);
    const now = new Date();

    const diffMs = now.getTime() - startDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    const days = Math.floor(diffSec / (60 * 60 * 24));
    const minutes = Math.floor((diffSec % (60 * 60 * 24)) / 60);
    const seconds = diffSec % 60;

    return { days, minutes, seconds };
  }

}

export const utils = new Utils;