
import { GeniDex, NetworkName, utils, Events, OutputOrder } from "../src/index";
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";
import { config } from "../test/config";
import { error } from "console";

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

    gEvents = new Events(genidex);
    await gEvents.start();
    gEvents.on('buyOrderPlaced', (order: OutputOrder)=>{
        console.log('buyOrderPlaced', order);
    })
    // gEvents.onPlaceBuyOrder( (event: BuyOrderEvent) => {
    //     console.log(event);
    // })

}

main();