
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

const functionRoles = [
    {
        roleId: ROLES.UPGRADER.roleId,
        functions: ['diamondCut']
    },
    {
        roleId: ROLES.PAUSER.roleId,
        functions: ['pause', 'unpause']
    },
    {
        roleId: ROLES.OPERATOR.roleId,
        functions: [
            //token
            'listToken', 'updateTokenIsUSD', 'updateUSDMarketID', 'updateMinOrderAmount', 'updateMinTransferAmount',
            //market
            'addMarket', 'updateMarketIsRewardable',
            //access
            'setGeniRewarder', 'setReferralRoot'
        ]
    },
];

async function main(){
    signer = await config.getOwner();
    signerAddress = await signer.getAddress();
    await genidex.connect(config.networkName, provider);
    await manager.connect(config.networkName, provider);
    console.log('accessManager', manager.address)

    const target = manager.network.contracts.GeniDex;
    const account1 = await config.getSigner(1);

    for(let functionRole of functionRoles){
        const {roleId, functions} = functionRole;
        const selectors: string[] = [];
        for(let functionName of functions){
            let selector = genidex.iface.getFunction(functionName)?.selector;
            if(selector) selectors.push(selector);
        }

        if(selectors.length==0) continue;
        const tx = await manager.setTargetFunctionRole({
            signer: signer,
            target: target,
            selectors: selectors,
            roleId: roleId
        });
        const receipt = await tx?.wait();
        console.log('receipt.hash', receipt?.hash)
    }


    const rawResult = await manager.getFunctionRoles(target, genidex.iface);
    const result = rawResult.filter(({ roleId }) => roleId > 0n);
    const result1 = rawResult.filter(({ roleId, stateMutability }) => roleId <= 0n && stateMutability != 'view');
    const result2 = rawResult.filter(({ roleId, stateMutability }) => roleId <= 0n && stateMutability == 'view');
    console.table(result)
    console.table(result1)
    console.table(result2)
    process.exit();
}

main();