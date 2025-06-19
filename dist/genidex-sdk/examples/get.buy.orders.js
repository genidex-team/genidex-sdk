import { GeniDex, NetworkName, constants } from "../src/index";
import { config } from "../test/config";
let genidex = new GeniDex();
let signer;
let signerAddress;
const ETH_ADDRESS = constants.ETH_ADDRESS;
let provider = config.provider;
async function main() {
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await genidex.connect(NetworkName.Geni, provider);
    // Check balance
    console.time();
    const buyOrders = await genidex.buyOrders.getAllBuyOrders(5);
    console.log(buyOrders);
    console.timeEnd();
}
main();
//# sourceMappingURL=get.buy.orders.js.map