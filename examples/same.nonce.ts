
import { GeniDex, NetworkName, constants, utils } from "../src/index";
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";
import { config } from "../test/config";
import { error } from "console";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;
const ETH_ADDRESS = constants.ETH_ADDRESS;
let provider = config.provider;

async function main(){
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider);

    // Check balance
    const balance1 = await genidex.balances.getBalance(signerAddress, ETH_ADDRESS)
    console.log('Balance1', utils.formatBaseUnit(balance1));

    // stop mine
    // await provider.send("evm_setAutomine", [true]);
    // await new Promise((r) => setTimeout(r, 1_000));
    await provider.send("evm_setAutomine", [false]);

    const nonce = await provider.getTransactionCount(signerAddress);
    console.log('nonce', nonce)

    await sendTx1(nonce);
    await sendTx2(nonce);

    // await new Promise((r) => setTimeout(r, 5_000));
    console.log('evm_setAutomine', true)
    await provider.send("evm_setAutomine", [true]);


}

async function sendTx1(nonce: any){
    let tx: any;
    try{
        tx = await genidex.balances.depositEth({
            signer,
            normAmount: utils.parseBaseUnit("1"),
            overrides: {
                gasPrice: ethers.parseUnits("20", "gwei"),
                nonce
            }
        });
    }catch(error: any){
        console.error("\n\n========== send tx1 fail ==============")
        // console.log(error);
        // console.log(error.payload)
        utils.logError(error);
    }
    if(tx){
        genidex.tx.wait(tx.hash).then((receipt)=>{
            console.log("\n\n========== tx1 confirmed ==============")
            console.log('receipt?.status:', receipt?.status);
        }).catch((error)=>{
            // console.log(error);
            utils.logError(error);
        })
    }
}

async function sendTx2(nonce: any){
    let tx: any;
    try{
        tx = await genidex.balances.depositEth({
            signer,
            normAmount: utils.parseBaseUnit("1"),
            overrides: {
                gasPrice: ethers.parseUnits("40", "gwei"),
                nonce
            }
        });
    }catch(error: any){
        console.error("\n\n========== send tx2 fail ==============")
        // console.log(error);
        // console.log(error.payload)
        utils.logError(error);
    }
    if(tx){
        genidex.tx.wait(tx.hash).then((receipt)=>{
            console.log("\n\n========== tx2 confirmed ==============")
            console.log('receipt?.status:', receipt?.status);
        }).catch((error)=>{
            // console.log(error);
            utils.logError(error);
        })
    }
    
}

main();