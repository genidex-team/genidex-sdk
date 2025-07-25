
import { ERC20, GeniDex, NetworkName, utils } from "../src/index";
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
    const {baseAddress} = market;

    // maxUint80 = 1,208,925,819,614,629,174,706,175;
    // const strAmount = '12089258196146291.74706175';
    // const strPrice = '12089258196146291.74706175';
    const strAmount = '1000';
    const strPrice = '1000';
    const {decimals} = await genidex.tokens.getTokenInfo(baseAddress);
    const erc20 = new ERC20(baseAddress, provider);
    // await erc20.mint(signer, signerAddress, parseUnits(strAmount, decimals) );

    await genidex.balances.depositToken({
        signer,
        tokenAddress: baseAddress,
        normAmount: utils.parseBaseUnit(strAmount),
        normApproveAmount: utils.parseBaseUnit(strAmount)
    });

    const normPrice = utils.parseBaseUnit(strPrice);
    const normQuantity = utils.parseBaseUnit(strAmount)
    const tx = await genidex.sellOrders.placeSellOrder({
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