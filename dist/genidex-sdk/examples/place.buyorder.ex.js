import { GeniDex } from "../src/index";
import { parseEther } from "ethers";
import { config } from "../test/config";
let genidex = new GeniDex();
let signer;
let signerAddress;
let provider = config.provider;
async function main() {
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider);
    const marketId = 1;
    const market = await genidex.markets.getMarket(marketId);
    // console.log(market);
    const { quoteAddress } = market;
    await genidex.balances.depositToken({
        signer,
        tokenAddress: quoteAddress,
        normAmount: parseEther("10000"),
        normApproveAmount: parseEther("10000")
    });
    const normPrice = parseEther("1");
    const normQuantity = parseEther("20");
    const tx = await genidex.buyOrders.placeBuyOrder({
        signer,
        marketId,
        normPrice,
        normQuantity
    });
    const receipt = await genidex.tx.wait(tx?.hash);
    console.log('\n\nreceipt', receipt);
    // console.log(receipt?.logs);
    if (receipt) {
        const logs = genidex.tx.decodeLogs(receipt.logs);
        console.log('\n\ndecodeLogs', logs);
    }
}
main();
//# sourceMappingURL=place.buyorder.ex.js.map