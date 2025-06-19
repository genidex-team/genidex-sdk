import { Contract, Provider, Signer, AddressLike, BigNumberish } from "ethers";
export declare class ERC20 {
    provider: Provider;
    readonly address: string;
    private contract;
    private verifiedContract;
    constructor(tokenAddress: string, provider: Provider);
    /**
     * Returns a new contract instance using the provided signer.
     * If no signer is passed, it falls back to the provider (read-only).
     *
     * @param signer - Optional signer for sending transactions.
     * @returns A new Contract instance connected with signer or provider.
     */
    getContract(signer?: Signer): Contract;
    readContract(method: string, args?: any[]): Promise<any>;
    verifyMethodExists(contract: Contract, method: string): void;
    verifyContractExists(): Promise<boolean | void>;
    name(): Promise<string>;
    symbol(): Promise<string>;
    decimals(): Promise<number>;
    totalSupply(): Promise<bigint>;
    balanceOf(account: AddressLike): Promise<bigint>;
    normBalanceOf(account: AddressLike, decimals: number): Promise<bigint>;
    allowance(owner: AddressLike, spender: AddressLike): Promise<bigint>;
    approve(signer: Signer, spender: AddressLike, amount: BigNumberish): Promise<void>;
    transfer(to: AddressLike, amount: BigNumberish): Promise<void>;
    transferFrom(from: AddressLike, to: AddressLike, amount: BigNumberish): Promise<void>;
    /**
     * Mint new tokens to the specified address.
     * Note: Only works if the token contract exposes a mint() function and caller has permission.
     */
    mint(signer: Signer, to: AddressLike, amount: BigNumberish): Promise<void>;
    /**
     * Burn tokens from the connected signer.
     * Note: Only works if the token contract supports burn().
     */
    burn(amount: BigNumberish): Promise<void>;
    /**
     * Fetch and return token metadata: symbol, name, and decimals.
     */
    getMeta(): Promise<{
        symbol: string;
        name: string;
        decimals: number;
    }>;
}
