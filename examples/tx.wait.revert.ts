
import { GeniDex, NetworkName, constants, utils } from "../src/index";
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";
import { config } from "../test/config";

let genidex  = new GeniDex();
let signer: Signer;
let signerAddress: string;
const ETH_ADDRESS = constants.ETH_ADDRESS;
let provider = config.provider;

async function main(){
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider);


    await provider.send("evm_setAutomine", [true]);
    // deposit
    await genidex.balances.depositEth({signer, normAmount: utils.parseBaseUnit("1") });
    // Check balance
    const balance1 = await genidex.balances.getBalance(signerAddress, ETH_ADDRESS)
    console.log('Balance1', utils.formatBaseUnit(balance1));

    // withdraw
    // await provider.send("evm_setAutomine", [false]);

    try{
        // const normAmount = utils.parseBaseUnit("1");
        const tx1 = await genidex.balances.withdrawEth({signer, normAmount: balance1});
        const tx2 = await genidex.balances.withdrawEth({signer, normAmount: balance1});

        genidex.tx.wait(tx1?.hash).then( async (receipt)=>{
            console.log('\n\n=========== tx1 successful ============\n\n')
            console.log(receipt?.hash);
        })

        genidex.tx.wait(tx2?.hash).then((receipt)=>{
            console.log('\n\n=========== tx2 successful ============\n\n')
            console.log(receipt?.hash);
        })
        .catch((error)=>{
            utils.logError(error);
        });

    }catch(error){
        utils.logError(error);
    }

    await provider.send("evm_setAutomine", [true]);

    // Check balance
    const balance2 = await genidex.balances.getBalance(signerAddress, ETH_ADDRESS)
    console.log('Balance2', utils.formatBaseUnit(balance2));


}

main();