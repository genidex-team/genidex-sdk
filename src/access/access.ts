
import {
    JsonRpcProvider, WebSocketProvider, BrowserProvider, Interface, id,
    FormatType,
    Result, ContractTransactionResponse,
    JsonFragment,
    FunctionFragment
} from 'ethers';
import {BaseContract} from '../base/base.contract.js';
import {accessManagerABI} from "../abis/access.manager.abi.js";
import {  NetworkName } from "../types.js";

import {config} from '../config/config.js';
import {
    Role, ROLES, RoleKey, RoleValue, 
    GrantRoleParams, SetTargetFunctionRoleParams,
    SelectorRole,
    FunctionRole,
    FunctionRoleObj
} from './access.types.js';

export class AccessManager extends BaseContract {

    constructor() {
        super();
        this.abi = accessManagerABI;
        this.iface = new Interface(this.abi);
    }

    async connect(
        networkName: NetworkName | string,
        providerOrRpc: WebSocketProvider | JsonRpcProvider | BrowserProvider | string
    ){
        let network    = config.getNetwork(networkName);
        let address    = network.contracts.AccessManager;
        if(!address) throw new Error('Invalid AccessManger contract address. Value: ' + address);
        await super.init(address, networkName, providerOrRpc);
    }

    async getAllRoles(): Promise<bigint[]>{
        return await this.readContract('getAllRoles');
    }

    async getRoleMembers(roleId: bigint): Promise<string[]>{
        const args = [roleId];
        const result = await this.readContract('getRoleMembers', args);
        return result.toArray();
    }

    async getAllRoleMembers(){
        const allRoles = await this.getAllRoles();
        // console.log( allRoles );
        let rolesMembers: any = [];
        for(let i in allRoles){
            const roleId = allRoles[i];
            const role = this.getRoleById(roleId);
            const members = await this.getRoleMembers(roleId);
            rolesMembers.push({
                roleId: role?.roleId,
                label: role?.label,
                members: members
            })
        }
        return rolesMembers;
    }

    getRoleById(roleId: bigint){
        const found = Object.values(ROLES).find(r => r.roleId === roleId);
        return found;
    }

    getRoleByKey(roleKey: string){
        return ROLES[roleKey as RoleKey];
    }

    async getFunctionRoles(target: string, abiOrInterface: string | JsonFragment[] | Interface): Promise<FunctionRole[]>{
        const iface = this.getInterface(abiOrInterface);
        const selectors = this.getAllSelectors(abiOrInterface);
        const functionRoleObj: FunctionRoleObj = await this.getTargetFunctionRoles(target, selectors);

        const functionRoles: FunctionRole[] = iface.fragments
        .filter((f): f is FunctionFragment => f.type === "function")
        .map(f => {
            const roleId: bigint = functionRoleObj[f.selector].roleId;
            // console.log(f)
            return {
                selector: f.selector as `0x${string}`,
                name: f.name,
                role: this.getRoleById(roleId)?.label,
                roleId: roleId,
                stateMutability: f.stateMutability
            }
        })
        return functionRoles;
    }

    async getTargetFunctionRole(target: string, selector: string): Promise<bigint>{
        //function getTargetFunctionRole(address target, bytes4 selector) view returns (uint64)
        const args = [target, selector];
        const result = await this.readContract('getTargetFunctionRole', args);
        return result;
    }

    async getTargetFunctionRoles(target: string, selectors: string[]): Promise<FunctionRoleObj>{
        //function getTargetFunctionRoles(address target, bytes4[] calldata selectors) external view
        // returns (SelectorRole[] memory roleIds)
        const args = [target, selectors];
        const rawResult = await this.readContract('getTargetFunctionRoles', args);
        // const functionRoles = Object.fromEntries(rawResult) as Record<`0x${string}`, bigint>;
        const result: FunctionRoleObj = {};
        for(let f of rawResult){
            const key = f[0];
            const roleId = f[1];
            result[key] = {
                roleId: roleId
            }
        }
        return result;
    }

    async grantRole({
        signer,
        roleId,
        account,
        executionDelay,
        overrides = {}
    }: GrantRoleParams): Promise<ContractTransactionResponse | undefined>{
        //grantRole(uint64 roleId, address account, uint32 executionDelay)
        let args = [roleId, account, executionDelay];
        return await this.writeContract({signer, method: 'grantRole', args, overrides});
    }

    async setTargetFunctionRole({
        signer,
        target,
        selectors,
        roleId,
        overrides = {}
    }: SetTargetFunctionRoleParams): Promise<ContractTransactionResponse | undefined>{
        // function setTargetFunctionRole(address target, bytes4[] selectors, uint64 roleId)
        let args = [target, selectors, roleId];
        return await this.writeContract({signer, method: 'setTargetFunctionRole', args, overrides});
    }

}