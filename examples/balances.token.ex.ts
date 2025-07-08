
import { GeniDex, NetworkName, utils, constants } from "../src/index";
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";
import { config } from "../test/config";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;
let tokenAddress: string;
let tokenDecimals: number;

async function main(){
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider);

    const tokens = await genidex.tokens.getAllTokens();
    tokenAddress = tokens[0];
    const token = await genidex.tokens.getTokenInfo(tokenAddress)
    tokenDecimals = token.decimals;

    await printAllBalances();

    console.log('\n\nDeposit 1 Token')
    let tx = await genidex.balances.depositToken({signer, tokenAddress, normAmount: utils.parseBaseUnit("1.00000001")});
    if(tx && tx.hash){
        await genidex.tx.wait(tx.hash);
        await printAllBalances();
    }

    console.log('\n\nWithdraw 1 Token')
    tx = await genidex.balances.withdrawToken({signer, tokenAddress, normAmount: utils.parseBaseUnit("1")});
    if(tx && tx.hash){
        await genidex.tx.wait(tx.hash);
        await printAllBalances();
    }

}

async function printAllBalances(){
    await printGeniDexBalance();
    await printUserWalletBalance();
    await printUserGeniBalance();
}

async function printGeniDexBalance(){
    // GeniDex balance
    const normWalletBal = await utils.getBalanceInBaseUnit(provider, genidex.address, tokenAddress, tokenDecimals);
    console.log('\n\Genidex balance\n')
    console.log({
        normWalletBal,
        format: utils.formatBaseUnit(normWalletBal),
    })
}

async function printUserWalletBalance(){
    // User\'s wallet balance
    const normWalletBal = await utils.getBalanceInBaseUnit(provider, signerAddress, tokenAddress, tokenDecimals);
    console.log('\n\nUser\'s wallet balance\n')
    console.log({
        normWalletBal,
        format: utils.formatBaseUnit(normWalletBal),
    })
}

async function printUserGeniBalance(){
    // User\'s balance on GeniDex
    const geniBal = await genidex.balances.getBalance(signerAddress, tokenAddress);
    console.log('\n\nUser\'s balance on GeniDex\n')
    console.log({
        geniBal,
        format: utils.formatBaseUnit(geniBal)
    })
}


main();