
import { ERC20, GeniDex, NetworkName, utils } from "../src/index";
import { formatEther, parseEther, parseUnits, Signature, Signer } from "ethers";
import { config } from "../test/config";
import { error } from "console";

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

    const {decimals} = await genidex.tokens.getTokenInfo(quoteAddress);
    const erc20 = new ERC20(quoteAddress, provider);
    await erc20.mint(signer, signerAddress, parseUnits("1000000", decimals) );

    await genidex.balances.depositToken({
        signer,
        tokenAddress: quoteAddress,
        normAmount: parseEther("10000"),
        normApproveAmount: parseEther("10000")
    });

    const normPrice = parseEther("1");
    const normQuantity = parseEther("100")
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