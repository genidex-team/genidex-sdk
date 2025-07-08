
import { GeniDex, NetworkName, utils, OutputOrder } from "../src/index";
import {Events} from "../src/events/index";
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";
import { config } from "../test/config";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;
let gEvents;

async function main(){
    console.log('get.orders')
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider);
    const marketId = 1;
    const market = await genidex.markets.getMarket(marketId);
    console.log(marketId);
    gEvents = new Events(genidex);
    await gEvents.start();
    gEvents.on('buyOrderPlaced', (order: OutputOrder)=>{
        console.log('buyOrderPlaced', order);
    })
    // gEvents.onPlaceBuyOrder( (event: BuyOrderEvent) => {
    //     console.log(event);
    // })
    await genidex.balances.depositToken({
        signer,
        tokenAddress: market.baseAddress,
        normAmount: utils.parseBaseUnit('1000')
    })
    await genidex.balances.depositToken({
        signer,
        tokenAddress: market.quoteAddress,
        normAmount: utils.parseBaseUnit('1000')
    })
    await genidex.sellOrders.placeSellOrder({
        signer,
        marketId,
        normPrice: utils.parseBaseUnit('1'),
        normQuantity: utils.parseBaseUnit('10')
    })
    await genidex.buyOrders.placeBuyOrder({
        signer,
        marketId,
        normPrice: utils.parseBaseUnit('1'),
        normQuantity: utils.parseBaseUnit('10')
    })
}

main();