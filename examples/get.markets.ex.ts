
import { GeniDex, NetworkName, utils } from "../src/index";
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";
import { config } from "../test/config";
import { error } from "console";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;

async function main(){
    console.log('get.markets')
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider);
    const marketId = 1;

    // markets
    console.time();
    const markets = await genidex.markets.getAllMarkets();
    console.table(markets);
    console.timeEnd()

}

main();