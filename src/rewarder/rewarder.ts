
import {JsonRpcProvider, WebSocketProvider, BrowserProvider, Result, ContractTransactionResponse} from 'ethers';
import {BaseContract} from '../base/base.contract.js';
import {rewarderABI} from "../abis/rewarder.abi.js";
import {  NetworkName } from "../types.js";

import {config} from '../config/config.js';
import { claimParams, RewardSystemInfo, UserRewardInfo } from './rewarder.types.js';


export class Rewarder extends BaseContract {

    constructor() {
        super();
    }

    async connect(
        networkName: NetworkName | string,
        providerOrRpc: WebSocketProvider | JsonRpcProvider | BrowserProvider | string,
        apiSocket?: any
    ){
        let network    = config.getNetwork(networkName);
        let address    = network.contracts.GeniRewarder;
        if(!address) throw new Error('Invalid GeniRewarder contract address. Value: ' + address);
        await super.init(address, rewarderABI, networkName, providerOrRpc);

        this.apiSocket  = apiSocket;
    }

    async emit(event: any, data: any) {
        return new Promise((resolve) => {
            this.apiSocket.emit(event, data, (response: any) => {
                resolve(response);
            });
        });
    }

    async getRewardSystemInfo(): Promise<RewardSystemInfo>{
        const result = await this.readContract('getRewardSystemInfo');
        return result.toObject();
    }

    async getUserRewardInfo(account: string): Promise<UserRewardInfo>{
        let args = [account];
        const result = await this.readContract('getUserRewardInfo', args);
        return result.toObject();
    }

    async claimTradingReward({
        signer,
        points,
        overrides = {}
    }: claimParams): Promise<ContractTransactionResponse | undefined>{
        let args = [points];
        return await this.writeContract({signer, method: 'claimTradingReward', args, overrides});
    }

    async claimReferralReward({
        signer,
        points,
        overrides = {}
    }: claimParams): Promise<ContractTransactionResponse | undefined>{
        let args = [points];
        return await this.writeContract({signer, method: 'claimReferralReward', args, overrides});
    }

}