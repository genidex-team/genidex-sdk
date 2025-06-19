import { getBigInt, Contract, Interface, isAddress } from "ethers";
import { abi } from '../../../genidex_contract/artifacts/contracts/GeniDex.sol/GeniDex.json';
import { IERC20Errors } from "./abi/IERC20Errors";
export class GeniDexCore {
    // public buyOrders: BuyOrders;
    // public sellOrders: SellOrders;
    constructor(contractAddress, provider) {
        this.contractAddress = contractAddress;
        this.provider = provider;
        this.tokens = {};
        this.abi = abi;
        this.address = contractAddress.toLocaleLowerCase();
        this.contract = new Contract(this.address, abi, provider);
        // this.buyOrders = new BuyOrders(this);
        // this.sellOrders = new SellOrders(this);
    }
    /**
     * Returns a new contract instance using the provided signer.
     * If no signer is passed, it falls back to the provider (read-only).
     *
     * @param signer - Optional signer for sending transactions.
     * @returns A new Contract instance connected with signer or provider.
     */
    getContract(signer) {
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
    calculateFee(normAmount) {
        const amount = typeof normAmount === "string" ? BigInt(normAmount) : normAmount;
        return amount / 1000n;
    }
    /**
     * Fetch metadata for a list of token addresses from the GeniDex contract.
     *
     * This method calls the on-chain `getTokensInfo(address[])` view function,
     * which returns details such as symbol, decimals, and market association for each token.
     *
     * @param tokenAddresses - An array of token contract addresses to query.
     * @returns A Promise resolving to an array of TokenInfo objects containing metadata for each token.
     *
     * Example output:
     * [
     *   {
     *     tokenAddress: "0xabc...",
     *     symbol: "USDC",
     *     usdMarketID: 1n,
     *     minOrderAmount: 10000000000000000000n
     *     decimals: 6,
     *     isUSD: true
     *   },
     *   ...
     * ]
     */
    async getTokensInfo(tokenAddresses) {
        const rawResults = await this.contract.getTokensInfo(tokenAddresses);
        return rawResults.map((item) => ({
            tokenAddress: item.tokenAddress,
            symbol: item.symbol,
            usdMarketID: BigInt(item.usdMarketID.toString()),
            minOrderAmount: BigInt(item.minOrderAmount.toString()),
            decimals: Number(item.decimals),
            isUSD: item.isUSD,
        }));
    }
    /**
     * Get metadata of a specific token.
     * If already cached, return from this.tokens.
     * Otherwise, fetch from contract and cache it.
     *
     * @param tokenAddress The address of the token.
     * @returns Promise resolving to TokenInfo or undefined if fetch fails.
     */
    async getTokenMeta(tokenAddress) {
        const key = tokenAddress.toLowerCase();
        // Return from cache if available
        if (this.tokens[key]) {
            return this.tokens[key];
        }
        // Optional: validate input
        if (!isAddress(tokenAddress)) {
            throw new Error(`Invalid token address: ${tokenAddress}`);
        }
        try {
            const infos = await this.getTokensInfo([tokenAddress]);
            if (infos.length === 1) {
                this.tokens[key] = infos[0];
                return infos[0];
            }
        }
        catch (err) {
            console.error("Failed to fetch token info:", err);
        }
        return {};
    }
    /**
     * Returns IDs of buy orders that have been fully filled (quantity == 0).
     *
     * @param buyOrders - Array of buy orders (OutputOrder[])
     * @returns Array of filled order IDs (bigint[])
     */
    getFilledOrderIDs(orders) {
        return orders
            .filter(order => getBigInt(order.quantity) === 0n)
            .map(order => order.id);
    }
    /**
     * Selects sell order IDs (sorted ascending by price) such that
     * the cumulative quantity exceeds or equals the requested normQuantity.
     *
     * @param sortedSellOrders - Array of sell orders sorted by price ascending
     * @param normQuantity - Maximum total quantity needed
     * @returns Array of order IDs
     */
    getMatchingOrderIds(sortedOrders, normQuantity) {
        const selectedIds = [];
        let total = 0n;
        const target = getBigInt(normQuantity);
        for (const order of sortedOrders) {
            if (total >= target)
                break;
            selectedIds.push(order.id);
            total += order.quantity;
        }
        return selectedIds;
    }
    /**
     * Decode a revert error thrown by a failed contract transaction.
     *
     * @param err - The caught error object (usually from try/catch around tx).
     * @param abi - The ABI of the contract that threw the error.
     * @returns A formatted string with the error name and arguments, or undefined if cannot decode.
     */
    decodeRevertError(err) {
        if (typeof err !== "object" ||
            err === null ||
            !("data" in err)) {
            return;
        }
        const data = err.data;
        if (!data || typeof data !== "string")
            return;
        try {
            const interfaces = [
                new Interface(this.abi),
                new Interface(IERC20Errors),
            ];
            for (const iface of interfaces) {
                try {
                    const parsed = iface.parseError(data);
                    if (parsed) {
                        const args = parsed.args?.map((a) => a.toString()).join(", ");
                        return `${parsed.name}(${args})`;
                    }
                    // return `${parsed?.name}(${parsed?.args.map((a) => a.toString()).join(", ")})`;
                }
                catch (_) {
                    continue;
                }
            }
            // const iface = new Interface(this.abi);
            // const parsed: null | ErrorDescription = iface.parseError(data);
            // return `${parsed?.name}(${parsed?.args.map((a) => a.toString()).join(", ")})`;
        }
        catch (decodeErr) {
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
    revertError(err, functionName, args) {
        const decoded = this.decodeRevertError(err);
        if (args) {
            const argsObj = this.mapArgsToObject(this.abi, functionName, args);
            console.error(`❌ ${functionName}, args:`, argsObj);
        }
        if (decoded) {
            console.error(err);
            console.error("❌ Reverted with:");
            console.log(decoded);
            throw new Error("❌ Reverted with: " + decoded);
        }
        else {
            console.error("❌ Unknown transaction error:");
            console.log(err);
            throw new Error("❌ Unknown transaction error");
        }
    }
    /**
     * Map an array of contract call arguments to an object using ABI parameter names.
     *
     * @param abi - The ABI of the contract.
     * @param methodName - The name of the function in the ABI.
     * @param args - Positional arguments array (must match ABI order).
     * @returns Object mapping parameter names to values.
     */
    mapArgsToObject(abi, methodName, args) {
        const iface = new Interface(abi);
        const fn = iface.getFunction(methodName);
        if (fn?.inputs.length !== args.length) {
            throw new Error(`Argument count mismatch for ${methodName}`);
        }
        const result = {};
        fn.inputs.forEach((input, index) => {
            result[input.name] = args[index];
        });
        return result;
    }
}
//# sourceMappingURL=genidex.core.js.map