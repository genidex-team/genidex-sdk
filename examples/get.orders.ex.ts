
import { GeniDex, NetworkName, utils } from "../src/index";
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";
import { config } from "../test/config";
import { error } from "console";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;

async function main(){
    console.log('get.orders')
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider);
    const marketId = 1;

    // buyOrders
    console.time();
    const buyOrders = await genidex.buyOrders.getOpenOrders(marketId);
    console.log('buyOrders', buyOrders.length);
    console.timeEnd()
    console.log({
        buyOrders: utils.formatOrders(buyOrders)
    })
    // return;

    // sellOrders
    console.time();
    const sellOrders = await genidex.sellOrders.getOpenOrders(marketId);
    console.log('sellOrders', sellOrders.length);
    console.timeEnd()
    console.log({
        sellOrders: utils.formatOrders(sellOrders)
    })

    // filledBuyOrders
    console.time();
    const filledBuyOrders = await genidex.buyOrders.getFilledBuyOrderIds(marketId);
    console.log('filledBuyOrders', filledBuyOrders.length);
    console.timeEnd()

    // randomFilledBuyOrderID
    console.time();
    const randomFilledBuyOrderID = await genidex.buyOrders.randomFilledBuyOrderID(marketId);
    console.log('randomFilledBuyOrderID', randomFilledBuyOrderID);
    console.timeEnd()

}

main();