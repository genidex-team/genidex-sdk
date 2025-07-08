
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";

import { GeniDex, NetworkName, utils } from "../src/index";
import {Admin} from "../src/admin/index";
import { config } from "../test/config";
import { error } from "console";

let genidex  = new GeniDex();
let admin: Admin;
let signer: Signer;
let owner: Signer;
let signerAddress: string;
let ownerAddress: string;
let provider = config.provider;

async function main(){
    signer = await config.getSigner();
    owner = await config.getOwner();
    signerAddress = await signer.getAddress();
    ownerAddress = await owner.getAddress();
    await genidex.connect(config.networkName, provider);
    admin = new Admin(genidex);

    let feeReceiver = await admin.getFeeReceiver();
    console.log('old address:', feeReceiver);

    const newAddress = await (await provider.getSigner(3)).getAddress();
    await admin.updateFeeReceiver({
        signer: owner,
        args: [newAddress]
    });

    feeReceiver = await admin.getFeeReceiver();
    console.log('new address:', feeReceiver);


}

main();