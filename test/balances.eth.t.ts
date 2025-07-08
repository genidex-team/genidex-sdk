

import { GeniDex, NetworkName, constants, utils } from "../src/index";
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
    console.log("Balance before deposit", utils.formatBaseUnit(balance1) );

    // provider.send('anvil_setBlockTimestampInterval', 12);
    // deposit

    // await provider.send("evm_setAutomine", [false]);
    // await provider.send("evm_setAutomine", [true]);
    const depositAmount = utils.parseBaseUnit("10");

    try{
        const tx = await genidex.balances.depositEth({signer, normAmount: depositAmount});
        await genidex.tx.wait(tx?.hash);
    }catch(error){
        console.log(error);
    }

    // check balance
    const balance2 = await genidex.balances.getBalance(signerAddress, ETH_ADDRESS)
    console.log("Balance after deposit", utils.formatBaseUnit(balance2) );
    expect(balance2).toBe(balance1 + depositAmount)

    // withdraw
    if(balance2>0){
        await genidex.balances.withdrawEth({signer, normAmount: balance2});

        // check balance
        const balance3 = await genidex.balances.getBalance(signerAddress, ETH_ADDRESS)
        console.log("Balance", utils.formatBaseUnit(balance3) );
        expect(balance3).toBe(0n)
    }
});

