import { Contract, JsonRpcProvider, Provider, Signer, AddressLike, BigNumberish } from "ethers";
import { utils } from "../utils";

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
  public provider: Provider;
  readonly address: string;
  private contract: Contract;
  private verifiedContract = false;

  constructor(tokenAddress: string, provider: Provider) {
    this.provider = provider;
    this.address = tokenAddress;
    this.contract = new Contract(tokenAddress, ERC20_ABI, provider);
  }

  /**
   * Returns a new contract instance using the provided signer.
   * If no signer is passed, it falls back to the provider (read-only).
   *
   * @param signer - Optional signer for sending transactions.
   * @returns A new Contract instance connected with signer or provider.
   */
  getContract(signer?: Signer): Contract {
      const runner = signer ?? this.provider;
      return new Contract(this.address, ERC20_ABI, runner);
  }

  async readContract(
    method: string,
    args: any[] = []
  ): Promise<any> {
    try {
      this.verifyMethodExists(this.contract, method);
      const result = await this.contract[method](...args);
      return result;
    } catch (err) {
      await this.verifyContractExists();
      // console.error(`readContract: Error calling "${method}"`, err);
      throw err;
    }
  }

  verifyMethodExists(contract: Contract, method: string) {
      if (typeof contract[method] !== "function") {
          throw new Error(`Method "${method}" does not exist on the contract.`);
      }
  }

  async verifyContractExists(): Promise<boolean | void> {
    if (this.verifiedContract) return true;
    const code = await this.provider.getCode(this.address);
    if (code === '0x') {
      throw new Error(`❌ No contract deployed at address: ${this.address}`);
    }
    this.verifiedContract = true;
    return true;
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

  async normBalanceOf(account: AddressLike): Promise<bigint> {
    const rawBalance = await this.balanceOf(account);
    const decimals = await this.decimals();
    const normBalance = utils.toNormAmount(rawBalance, decimals);
    return normBalance;
  }

  async allowance(owner: AddressLike, spender: AddressLike): Promise<bigint> {
    return await this.readContract('allowance', [owner, spender]);
    // return await this.contract.allowance(owner, spender);
  }

  async approve(signer: Signer, spender: AddressLike, amount: BigNumberish): Promise<void> {
    const contract = this.getContract(signer);
    const tx = await contract.approve(spender, amount);
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
  async mint(signer: Signer, to: AddressLike, amount: BigNumberish): Promise<void> {
    const contract = this.getContract(signer);
    if (!this.contract.mint) throw new Error("mint() not available on this contract");
    const tx = await contract.mint(to, amount);
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
