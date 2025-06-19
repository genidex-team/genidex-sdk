
import { GeniDex, NetworkName, constants } from "../src/index";
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
    await genidex.connect(NetworkName.Localhost, provider);

    // Check balance
    const balance1 = await genidex.balances.getBalance(signerAddress, ETH_ADDRESS)
    console.log('Balance1', formatEther(balance1));

    // stop mine
    await provider.send("evm_setAutomine", [false]);

    const nonce = await provider.getTransactionCount(signerAddress);

    await sendTx1(nonce);
    await sendTx2(nonce);

    // await new Promise((r) => setTimeout(r, 15_000));
    console.log('evm_setAutomine', true)
    await provider.send("evm_setAutomine", [true]);


}

async function sendTx1(nonce: any){
    let tx: any;
    try{
        tx = await genidex.balances.depositEth({
            signer,
            normAmount: parseEther("1"),
            overrides: {
                gasPrice: ethers.parseUnits("20", "gwei"),
                nonce
            }
        });
    }catch(error){
        console.log(error);
        return;
    }
    // wait tx1
    if(!tx) return;
    genidex.tx.wait(tx?.hash).then((receipt)=>{
        console.log('\n\n=========== tx1 successful ============\n\n')
        console.log(receipt);
    })
    .catch(async (error)=>{
        console.log('\n\n=========== tx1 error ============\n\n')
        console.error(error)
        if(error.code=='TRANSACTION_REPLACED'){
            const newTx = await genidex.tx.findTxByNonce(tx.from, tx.nonce);
            if(!newTx) return;
            try{
                const receipt = await genidex.tx.wait(newTx.hash);
                console.log('\n\n=========== tx1 TRANSACTION_REPLACED ============\n\n')
                console.log(receipt);
            }catch(error2: any){
                console.log('error2', error2);
                // if(error2.info){
                //     console.log(error2.info.payload)
                // }
            }
        }else{
            console.log(error);
        }
    });
}

async function sendTx2(nonce: any){
    let tx: any;
    try{
        tx = await genidex.balances.depositEth({
            signer,
            normAmount: parseEther("1"),
            overrides: {
                gasPrice: ethers.parseUnits("30", "gwei"),
                nonce
            }
        });
    }catch(error){
        console.log(error);
        return;
    }
    // wait tx2
    genidex.tx.wait(tx?.hash).then((receipt)=>{
        console.log('\n\n=========== tx2 successful ============\n\n')
        console.log(receipt);
    })
    .catch((error)=>{
        console.log('\n\n=========== tx2 error ============\n\n')
        console.log(error);
    });
}

main();