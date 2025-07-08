
import { GeniDex, NetworkName, utils, constants } from "../src/index";
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";
import { config } from "../test/config";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;
let tx;

async function main(){
    console.log('balances.eth');
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider);

    await printUserWalletBalance();
    await printUserGeniBalance();

    console.log('\n\nDeposit 1 ETH')
    tx = await genidex.balances.depositEth({signer, normAmount: utils.parseBaseUnit("1.00000001")});
    if(tx && tx.hash){
        await genidex.tx.wait(tx.hash);
        await printUserWalletBalance();
        await printUserGeniBalance();
    }

    await printDexBalance();
    // return;
    console.log('\n\nWithdraw 1 ETH')
    tx = await genidex.balances.withdrawEth({signer, normAmount: utils.parseBaseUnit("1")});
    if(tx && tx.hash){
        await genidex.tx.wait(tx.hash);
        await printUserWalletBalance();
        await printUserGeniBalance();
    }

}

async function printDexBalance(){
    // wallet balance
    console.log('\n\nDex\'s balance\n')
    const normWalletBal = await utils.getETHBalanceInBaseUnit(provider, genidex.address);
    console.log({
        normWalletBal,
        format: utils.formatBaseUnit(normWalletBal),
    })
}

async function printUserWalletBalance(){
    // wallet balance
    console.log('\n\nUser\'s balance on the wallet\n')

    const normWalletBal = await utils.getETHBalanceInBaseUnit(provider, signerAddress);
    console.log({
        normWalletBal,
        format: utils.formatBaseUnit(normWalletBal),
    })
}

async function printUserGeniBalance(){
    // GeniDex balance
    const geniBal = await genidex.balances.getETHBalance(signerAddress);
    console.log('\n\nUser\'s balance on GeniDex\n')
    console.log({
        geniBal,
        geniBalFormat: utils.formatBaseUnit(geniBal)
    })
}


main();