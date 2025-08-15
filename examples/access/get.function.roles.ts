
import {GeniDex} from "../../src/index";
import {AccessManager} from "../../src/access";
import {GrantRoleParams, ROLES} from "../../src/access/access.types";
import { Signer, Contract, FunctionFragment, FormatType } from "ethers";
import { config } from "../../test/config";

let genidex = new GeniDex();
let manager  = new AccessManager();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;

async function main(){
    signer = await config.getOwner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider);
    await manager.connect(config.networkName, provider);
    console.log('accessManager', manager.address)
    // const genidexContract = genidex.getContract();
    //accessManager 0xE03811Dd501FB48751F44c1bC8801b7fFcF7C2aD

    // const geniDexAddr = manager.network.contracts.GeniDex;
    // const contract = new Contract(manager.network.contracts.GeniDex, abi, provider);
    // console.log(genidex.iface);
    // const iface = genidex.iface;

    const functionRoles = await manager.getFunctionRoles(genidex.address, genidex.iface);
    // functionRoles.filter((f)=>f)
    // console.log(functionRoles);

    console.table(functionRoles)
    process.exit();

}

main();