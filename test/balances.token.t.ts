

import { ERC20, GeniDex, NetworkName, TokenInfo, utils } from "../src/index";
import { BigNumberish, ethers, Signature, Signer } from "ethers";
import { config } from "./config";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;
var tokenAddress: string;
var tokenDecimals: number;
var token: TokenInfo;

beforeAll(async() => {
    await genidex.connect(config.networkName, config.provider);
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
});

test("deposit, withdraw, getTokenBalance", async () => {

    const tokens = await genidex.tokens.getAllTokens();
    tokenAddress = tokens[0];
    const token = await genidex.tokens.getTokenInfo(tokenAddress)
    tokenDecimals = token.decimals;

    const balance1 = await genidex.balances.getBalance(signerAddress, tokenAddress)
    console.log("Balance", utils.formatBaseUnit(balance1) );

    // deposit
    const depositAmount = utils.parseBaseUnit("100");
    await depositAndCheck(depositAmount);

    // check balance
    const balance2 = await genidex.balances.getBalance(signerAddress, tokenAddress)
    console.log("Balance", utils.formatBaseUnit(balance2) );
    expect(balance2).toBe(balance1 + depositAmount)

    // withdraw
    if(balance2>0){
        // const withdrawalAmount = utils.parseNorm("100");
        let tx = await genidex.balances.withdrawToken({signer, tokenAddress, normAmount: balance2});
        await genidex.tx.wait(tx?.hash);

        // check balance
        const balance3 = await genidex.balances.getBalance(signerAddress, tokenAddress)
        console.log("Balance", utils.formatBaseUnit(balance3) );
        expect(balance3).toBe(0n)
    }
});

async function deposit(depositAmount: BigNumberish){
    let tx = await genidex.balances.depositToken({
        signer, tokenAddress, normAmount: depositAmount
    });
    await genidex.tx.wait(tx?.hash);
}

async function depositAndCheck(depositAmount: bigint){
    const token = new ERC20(tokenAddress, config.provider);
    const dexBal = await token.normBalanceOf(genidex.address);
    const userWalletBal = await token.normBalanceOf(signerAddress);
    const userDexBal = await genidex.balances.getBalance(signerAddress, tokenAddress);

    await deposit(depositAmount);

    const dexBal2 = await token.normBalanceOf(genidex.address);
    const userWalletBal2 = await token.normBalanceOf(signerAddress);
    const userDexBal2 = await genidex.balances.getBalance(signerAddress, tokenAddress);

    // dex
    expect(dexBal2).toBe(dexBal + depositAmount);

    // user's balance on the wallet
    expect(userWalletBal2).toBe(userWalletBal - depositAmount);
    // user's balance on GeniDex
    expect(userDexBal2).toBe(userDexBal + depositAmount);
}
