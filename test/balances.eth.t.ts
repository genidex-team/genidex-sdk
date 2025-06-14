

import { GeniDex, NetworkName, constants } from "../src/index";
import { ethers, Signature, Signer } from "ethers";
import { config } from "./config";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;
const ETH_ADDRESS = constants.ETH_ADDRESS;
let provider = config.provider;

beforeAll(async() => {
    await genidex.connect(config.networkName, config.provider);
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
});

test("deposit, withdraw, getTokenBalance", async () => {

    // check balance
    const balance1 = await genidex.balances.getBalance(signerAddress, ETH_ADDRESS)
    console.log("Balance before deposit", ethers.formatEther(balance1) );

    // provider.send('anvil_setBlockTimestampInterval', 12);
    // deposit

    await provider.send("evm_setAutomine", [false]);
    const depositAmount = ethers.parseEther("1");

    try{
        const tx = await genidex.balances.depositEth({signer, normAmount: depositAmount});
        if(tx) tx.waitForConfirms().then((receipt)=>{
            console.log(receipt?.hash);
        })
    }catch(error){
        console.log(error);
    }
    
    try {
        const tx2 = await genidex.balances.depositEth({signer, normAmount: depositAmount});
        if(tx2) tx2.waitForConfirms().then((receipt)=>{
            console.log(receipt?.hash);
        })
    } catch (error) {
        console.log(error);
    }

    await provider.send("evm_setAutomine", [true]);

    await new Promise((r) => setTimeout(r, 1000));
    // return;

    // check balance
    const balance2 = await genidex.balances.getBalance(signerAddress, ETH_ADDRESS)
    console.log("Balance after deposit", ethers.formatEther(balance2) );
    expect(balance2).toBe(balance1 + depositAmount)

    // withdraw
    if(balance2>0){
        await genidex.balances.withdrawEth({signer, normAmount: balance2});

        // check balance
        const balance3 = await genidex.balances.getBalance(signerAddress, ETH_ADDRESS)
        console.log("Balance", ethers.formatEther(balance3) );
        expect(balance3).toBe(0n)
    }
});

