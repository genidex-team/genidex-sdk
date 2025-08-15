import {GeniDex, utils, constants} from "../../src/index";
import { Signer, Contract, FunctionFragment, FormatType, ethers } from "ethers";
import { config } from "../../test/config";

let genidex = new GeniDex();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;

async function depositAllTokens(signer: Signer, tokens: string[]){
    for(let token of tokens){
        console.log('deposit: ', await signer.getAddress(), token);
        if(token==constants.ETH_ADDRESS){
            await genidex.balances.depositEth({
                signer: signer,
                normAmount: utils.parseBaseUnit('100')
            });
        }else{
            await genidex.balances.depositToken({
                signer: signer,
                normAmount: utils.parseBaseUnit('1000'),
                tokenAddress: token
            });
        }
    }
}

async function main(){
    await genidex.connect(config.networkName, provider);
    const [deployer, upgrader, pauser, operator, trader1, trader2, trader3, trader4, trader5] = await config.getSigners();
    const tokens = await genidex.tokens.getAllTokens();
    console.log(tokens)
    depositAllTokens(trader1, tokens);
    depositAllTokens(trader2, tokens);
    depositAllTokens(trader3, tokens);
    depositAllTokens(trader4, tokens);
    depositAllTokens(trader5, tokens);
}

main();