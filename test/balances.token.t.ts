

import { GeniDex, NetworkName } from "../src/index";
import { ethers, Signature, Signer } from "ethers";
import { config } from "./config";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;


beforeAll(async() => {
    await genidex.connect(config.networkName, config.provider);
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
});

test("deposit, withdraw, getTokenBalance", async () => {

    const tokens = await genidex.tokens.getAllTokens();
    const tokenAddress = tokens[0];

    const balance1 = await genidex.balances.getBalance(signerAddress, tokenAddress)
    console.log("Balance", ethers.formatEther(balance1) );

    // deposit
    const depositAmount = ethers.parseEther("100");
    const approveAmount = depositAmount;
    await genidex.balances.depositToken({
        signer, tokenAddress, normAmount: depositAmount, normApproveAmount: approveAmount
    });

    // check balance
    const balance2 = await genidex.balances.getBalance(signerAddress, tokenAddress)
    console.log("Balance", ethers.formatEther(balance2) );
    expect(balance2).toBe(balance1 + depositAmount)

    // withdraw
    if(balance2>0){
        // const withdrawalAmount = ethers.parseEther("100");
        await genidex.balances.withdrawToken({signer, tokenAddress, normAmount: balance2});

        // check balance
        const balance3 = await genidex.balances.getBalance(signerAddress, tokenAddress)
        console.log("Balance", ethers.formatEther(balance3) );
        expect(balance3).toBe(0n)
    }

    
});

