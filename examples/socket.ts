
import { GeniDex, NetworkName, utils } from "../src/index";
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";
import { config } from "../test/config";
import { error } from "console";
import { io } from "socket.io-client";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;

const apiSocket = io("https://genidex.net/", {
    path: "/socket/",
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 5000
});

/*async function emit(event: any, data: any) {
  return new Promise((resolve) => {
    apiSocket.emit(event, data, (response: any) => {
      resolve(response);
    });
  });
}*/

async function main(){
    console.log('socket')
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider, apiSocket);

    const marketId = 1;
    const price = "0.05";
    const quantity = "500";

    /*console.time();
    const args = await emit('get-order-args', {
        network: 'geni',
        type: 'sell',
        marketId: marketId,
        price: utils.parseBaseUnit(price).toString(),
        quantity: utils.parseBaseUnit(quantity).toString()
    });
    console.timeEnd();
    console.log(args);*/

    let tx = await genidex.sellOrders.placeSellOrder({
    // let tx = await genidex.buyOrders.placeBuyOrder({
        signer,
        marketId,
        normPrice: utils.parseBaseUnit(price),
        normQuantity: utils.parseBaseUnit(quantity)
    })
    const receipt = await genidex.tx.wait(tx?.hash);
    console.log(receipt?.hash)
    if(receipt){
        const logs = genidex.tx.decodeLogs(receipt?.logs);
        console.log(logs)
    }


}

main();