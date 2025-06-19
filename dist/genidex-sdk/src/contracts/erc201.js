import { Contract } from "ethers";
const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount)",
    "function burn(uint256 amount)"
];
export class ERC20 {
    constructor(tokenAddress, providerOrSigner) {
        this.address = tokenAddress;
        this.contract = new Contract(tokenAddress, ERC20_ABI, providerOrSigner);
    }
    async name() {
        return await this.contract.name();
    }
    async symbol() {
        return await this.contract.symbol();
    }
    async decimals() {
        return await this.contract.decimals();
    }
    async totalSupply() {
        return await this.contract.totalSupply();
    }
    async balanceOf(account) {
        return await this.contract.balanceOf(account);
    }
    async allowance(owner, spender) {
        return await this.contract.allowance(owner, spender);
    }
    async approve(spender, amount) {
        const tx = await this.contract.approve(spender, amount);
        await tx.wait();
    }
    async transfer(to, amount) {
        const tx = await this.contract.transfer(to, amount);
        await tx.wait();
    }
    async transferFrom(from, to, amount) {
        const tx = await this.contract.transferFrom(from, to, amount);
        await tx.wait();
    }
    /**
     * Mint new tokens to the specified address.
     * Note: Only works if the token contract exposes a mint() function and caller has permission.
     */
    async mint(to, amount) {
        if (!this.contract.mint)
            throw new Error("mint() not available on this contract");
        const tx = await this.contract.mint(to, amount);
        await tx.wait();
    }
    /**
     * Burn tokens from the connected signer.
     * Note: Only works if the token contract supports burn().
     */
    async burn(amount) {
        if (!this.contract.burn)
            throw new Error("burn() not available on this contract");
        const tx = await this.contract.burn(amount);
        await tx.wait();
    }
    /**
     * Fetch and return token metadata: symbol, name, and decimals.
     */
    async getMeta() {
        const [symbol, name, decimals] = await Promise.all([
            this.contract.symbol(),
            this.contract.name(),
            this.contract.decimals()
        ]);
        return { symbol, name, decimals };
    }
}
