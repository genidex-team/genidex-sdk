
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
    await genidex.connect(NetworkName.Geni, provider);
    const marketId = 5;

    // buyOrders
    console.time();
    const buyOrders = await genidex.buyOrders.getAllBuyOrders(marketId);
    console.log('buyOrders', buyOrders.length);
    console.timeEnd()

    // sellOrders
    console.time();
    const sellOrders = await genidex.sellOrders.getAllSellOrders(marketId);
    console.log('sellOrders', sellOrders.length);
    console.timeEnd()

    // filledBuyOrders
    console.time();
    const filledBuyOrders = await genidex.buyOrders.getFilledBuyOrderIds(marketId);
    console.log('filledBuyOrders', filledBuyOrders);
    console.timeEnd()

    // randomFilledBuyOrderID
    console.time();
    const randomFilledBuyOrderID = await genidex.buyOrders.randomFilledBuyOrderID(marketId);
    console.log('randomFilledBuyOrderID', randomFilledBuyOrderID);
    console.timeEnd()

}

main();