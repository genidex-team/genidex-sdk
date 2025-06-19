import { Contract } from "ethers";
import { abi } from '../../../genidex_contract/artifacts/contracts/GeniDex.sol/GeniDex.json';
export class GeniDexCore {
    // public buyOrders: BuyOrders;
    // public sellOrders: SellOrders;
    constructor(contractAddress, provider) {
        this.contractAddress = contractAddress;
        this.provider = provider;
        this.abi = abi;
        this.address = contractAddress.toLocaleLowerCase();
        this.contract = new Contract(this.address, abi, provider);
        // this.buyOrders = new BuyOrders(this);
        // this.sellOrders = new SellOrders(this);
    }
}
//# sourceMappingURL=genidex.core.js.map