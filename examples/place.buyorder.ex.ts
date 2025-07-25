
import { constants, ERC20, GeniDex, utils } from "../src/index";
import { parseUnits, Signer } from "ethers";
import { config } from "../test/config";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;

async function main(){
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider);
    const marketId = 1;

    const market = await genidex.markets.getMarket(marketId);
    // console.log(market);
    const {quoteAddress} = market;
    // return;

    // maxUint80 = 1,208,925,819,614,629,174,706,175;
    // const strAmount = '12089258196146291.74706175';
    // const strPrice = '12089258196146291.74706175';
    const strAmount = '1000';
    const strPrice = '1000';
    const normPrice = utils.parseBaseUnit(strPrice);
    const normQuantity = utils.parseBaseUnit(strAmount);
    let total = normPrice * normQuantity / constants.BASE_UNIT;
    let totalAndFee = total + total / 1000n;

    const {decimals} = await genidex.tokens.getTokenInfo(quoteAddress);
    const erc20 = new ERC20(quoteAddress, provider);
    const strMintAmount = '12089258196146291.747062';
    // await erc20.mint(signer, signerAddress, parseUnits(strMintAmount, decimals) );
    // await erc20.mint(signer, signerAddress, utils.toRawAmount(totalAndFee, decimals) );

    let dTx = await genidex.balances.depositToken({
        signer,
        tokenAddress: quoteAddress,
        normAmount: totalAndFee,
        normApproveAmount: totalAndFee
    });
    await genidex.tx.wait(dTx?.hash);

    const balance = await genidex.balances.getBalance(signerAddress, quoteAddress);
    console.log({
        balance,
        format: utils.formatBaseUnit(balance)
    })

    const tx = await genidex.buyOrders.placeBuyOrder({
        signer,
        marketId,
        normPrice,
        normQuantity
    })

    const receipt = await genidex.tx.wait(tx?.hash);

    // console.log(receipt?.logs);
    if(receipt){
        console.log('\n\nreceipt', receipt.hash);
        const logs: any = genidex.tx.decodeLogs(receipt.logs);
        console.log('\n\ndecodeLogs', logs[0].argsObject)
    }

}

main();