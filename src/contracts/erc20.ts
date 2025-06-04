import { Contract, JsonRpcProvider, Signer, AddressLike, BigNumberish } from "ethers";
import { toNormAmount } from "../utils";

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
  readonly address: string;
  private contract: Contract;

  constructor(tokenAddress: string, providerOrSigner: JsonRpcProvider | Signer) {
    this.address = tokenAddress;
    this.contract = new Contract(tokenAddress, ERC20_ABI, providerOrSigner);
  }

  async name(): Promise<string> {
    return await this.contract.name();
  }

  async symbol(): Promise<string> {
    return await this.contract.symbol();
  }

  async decimals(): Promise<number> {
    return await this.contract.decimals();
  }

  async totalSupply(): Promise<bigint> {
    return await this.contract.totalSupply();
  }

  async balanceOf(account: AddressLike): Promise<bigint> {
    return await this.contract.balanceOf(account);
  }

  async normBalanceOf(account: AddressLike, decimals: number): Promise<bigint> {
    const rawBalance = await this.contract.balanceOf(account);
    const normBalance = toNormAmount(rawBalance, decimals);
    return normBalance;
  }

  async allowance(owner: AddressLike, spender: AddressLike): Promise<bigint> {
    return await this.contract.allowance(owner, spender);
  }

  async approve(spender: AddressLike, amount: BigNumberish): Promise<void> {
    const tx = await this.contract.approve(spender, amount);
    await tx.wait();
  }

  async transfer(to: AddressLike, amount: BigNumberish): Promise<void> {
    const tx = await this.contract.transfer(to, amount);
    await tx.wait();
  }

  async transferFrom(from: AddressLike, to: AddressLike, amount: BigNumberish): Promise<void> {
    const tx = await this.contract.transferFrom(from, to, amount);
    await tx.wait();
  }

  /**
   * Mint new tokens to the specified address.
   * Note: Only works if the token contract exposes a mint() function and caller has permission.
   */
  async mint(to: AddressLike, amount: BigNumberish): Promise<void> {
    if (!this.contract.mint) throw new Error("mint() not available on this contract");
    const tx = await this.contract.mint(to, amount);
    await tx.wait();
  }

  /**
   * Burn tokens from the connected signer.
   * Note: Only works if the token contract supports burn().
   */
  async burn(amount: BigNumberish): Promise<void> {
    if (!this.contract.burn) throw new Error("burn() not available on this contract");
    const tx = await this.contract.burn(amount);
    await tx.wait();
  }

  /**
   * Fetch and return token metadata: symbol, name, and decimals.
   */
  async getMeta(): Promise<{ symbol: string; name: string; decimals: number }> {
    const [symbol, name, decimals] = await Promise.all([
      this.contract.symbol(),
      this.contract.name(),
      this.contract.decimals()
    ]);
    return { symbol, name, decimals };
  }
}
