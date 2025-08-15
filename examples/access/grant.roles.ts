
import {AccessManager} from "../../src/access";
import {GrantRoleParams, ROLES} from "../../src/access/access.types";
import { Signer } from "ethers";
import { config } from "../../test/config";

let manager  = new AccessManager();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;

async function main(){
    signer = await config.getOwner();
    signerAddress = await signer.getAddress();
    await manager.connect(config.networkName, provider);

    const operator = await config.getSigner(1);
    const tx = await manager.grantRole({
        signer: signer,
        roleId: ROLES.UPGRADER.roleId,
        account: await operator.getAddress(),
        executionDelay: 0
    });
    const receipt = await tx?.wait();
    console.log('receipt.hash', receipt?.hash)

}

main();