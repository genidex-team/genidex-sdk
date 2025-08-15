
import {AccessManager} from "../../src/access";
import {GrantRoleParams, RoleKey, ROLES} from "../../src/access/access.types";
import { Signer } from "ethers";
import { config } from "../../test/config";
import data from 'geni_data';

let manager  = new AccessManager();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;

async function main(){
    const roleMembers = data.getRoleMembers();
    // console.table(roleMembers); process.exit();
    signer = await config.getOwner();
    signerAddress = await signer.getAddress();
    await manager.connect(config.networkName, provider);

    for(let roleKey in roleMembers){
        const members = roleMembers[roleKey];
        for(let member of members){
            console.log(roleKey, member)
            const tx = await manager.grantRole({
                signer: signer,
                roleId: manager.getRoleByKey(roleKey).roleId,
                account: await member,
                executionDelay: 0
            });
            const receipt = await tx?.wait();
            // console.log('receipt.hash', receipt?.hash)
        }
    }

    const onChainRoleMembers = await manager.getAllRoleMembers();
    console.table(onChainRoleMembers)

}

main();