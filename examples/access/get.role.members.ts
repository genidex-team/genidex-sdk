
import {AccessManager} from "../../src/access";
import {RoleValue} from "../../src/access/access.types";
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";
import { config } from "../../test/config";

let manager  = new AccessManager();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;

async function main(){
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await manager.connect(config.networkName, provider);

    // await provider.send("evm_mine", []);

    const roleMembers = await manager.getAllRoleMembers();
    console.table(roleMembers)

    // return;

}

main();