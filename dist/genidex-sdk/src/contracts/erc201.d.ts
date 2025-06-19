import { JsonRpcProvider, Signer, AddressLike, BigNumberish } from "ethers";
export declare class ERC20 {
    readonly address: string;
    private contract;
    constructor(tokenAddress: string, providerOrSigner: JsonRpcProvider | Signer);
    name(): Promise<string>;
    symbol(): Promise<string>;
    decimals(): Promise<number>;
    totalSupply(): Promise<bigint>;
    balanceOf(account: AddressLike): Promise<bigint>;
    allowance(owner: AddressLike, spender: AddressLike): Promise<bigint>;
    approve(spender: AddressLike, amount: BigNumberish): Promise<void>;
    transfer(to: AddressLike, amount: BigNumberish): Promise<void>;
    transferFrom(from: AddressLike, to: AddressLike, amount: BigNumberish): Promise<void>;
    /**
     * Mint new tokens to the specified address.
     * Note: Only works if the token contract exposes a mint() function and caller has permission.
     */
    mint(to: AddressLike, amount: BigNumberish): Promise<void>;
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
