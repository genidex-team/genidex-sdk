
import {GeniDex} from "../../src/index";
import {AccessManager} from "../../src/access";
import {GrantRoleParams, ROLES} from "../../src/access/access.types";
import { Signer, Contract } from "ethers";
import { config } from "../../test/config";

let genidex = new GeniDex();
let manager  = new AccessManager();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;

async function main(){
    signer = await config.getOwner();
    signerAddress = await signer.getAddress();
    await manager.connect(config.networkName, provider);
    console.log('accessManager', manager.address)
    // const genidexContract = genidex.getContract();

    // const geniDexAddr = manager.network.contracts.GeniDex;
    // const contract = new Contract(manager.network.contracts.GeniDex, abi, provider);
    const selector = genidex.iface.getFunction('test')?.selector;
    console.log(selector);

    if(!selector) return;
    const target = manager.network.contracts.GeniDex;
    const account1 = await config.getSigner(1);
    const tx = await manager.setTargetFunctionRole({
        signer: signer,
        target: target,
        selectors: [selector],
        roleId: ROLES.OPERATOR.roleId
    });
    const receipt = await tx?.wait();
    console.log('receipt.hash', receipt?.hash)

    console.log( await manager.getTargetFunctionRole(target, selector) )

}

main();