
import { AddressLike, BigNumberish, Contract, ContractTransactionResponse, getBigInt, Overrides, Signer, TransactionReceipt, TransactionResponse, ZeroAddress } from 'ethers';
import { GeniDex } from '../genidex/genidex.js';
import { MarketMap, Orders } from '../types.js';
import { utils } from '../utils.js';
import './admin.types.js';
import { AddMarketParams, ListTokenParams, SetGeniRewarderParams, UpdateFeeReceiverParams, UpdateMarketIsRewardableParams, UpdateMinOrderAmountParams, UpdateMinTransferAmountParams, UpdateTokenIsUSDParams, UpdateUSDMarketIDParams, WriteContractParams } from './admin.types.js';
import { constants } from '../constants.js';
import { BaseContract } from '../base/base.contract.js';


export class Admin extends BaseContract{
    genidex!: GeniDex;
    contract: Contract;
    buyOrders: Orders = {};
    sellOrders: Orders = {};
    markets: MarketMap = {}

    constructor(_genidex: GeniDex) {
        super();
        // console.log('admin')
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
    }

    async listToken({
        signer, tokenAddress, minTransferAmount, minOrderAmount = 0,
        usdMarketID=0, isUSD=false, autoDetect = true, manualDecimals=0,
        manualSymbol='', overrides = {}
    }: ListTokenParams){
        const args = [
            tokenAddress, minTransferAmount, minOrderAmount,
            usdMarketID, isUSD, autoDetect,
            manualSymbol, manualDecimals
        ];
        return this.genidex.writeContract({
            signer,
            method: 'listToken',
            args: args,
            overrides: overrides
        })
    }

    async addMarket({
        signer,
        baseToken,
        quoteToken,
        overrides = {}
    }: AddMarketParams){
        const args = [baseToken, quoteToken];
        return this.genidex.writeContract({
            signer,
            method: 'addMarket',
            args: args,
            overrides: overrides
        })
    }

    async updateFeeReceiver({
        signer,
        newAddress,
        overrides = {}
    }: UpdateFeeReceiverParams){
        const args = [newAddress];
        return this.genidex.writeContract({
            signer,
            method: 'updateFeeReceiver',
            args: args,
            overrides: overrides
        })
    }

    async setGeniRewarder({
        signer,
        rewarderAddress,
        overrides = {}
    }: SetGeniRewarderParams){
        const args = [rewarderAddress];
        return this.genidex.writeContract({
            signer,
            method: 'setGeniRewarder',
            args: args,
            overrides: overrides
        })
    }

    async updateTokenIsUSD({
        signer,
        tokenAddress,
        isUSD,
        overrides = {}
    }: UpdateTokenIsUSDParams) {
        const args = [tokenAddress, isUSD];
        return this.genidex.writeContract({
            signer,
            method: 'updateTokenIsUSD',
            args,
            overrides
        });
    }

    async updateUSDMarketID({
        signer,
        tokenAddress,
        marketID,
        overrides = {}
    }: UpdateUSDMarketIDParams) {
        const args = [tokenAddress, marketID];
        return this.genidex.writeContract({
            signer,
            method: 'updateUSDMarketID',
            args,
            overrides
        });
    }

    async updateMinOrderAmount({
        signer,
        tokenAddress,
        minOrderAmount,
        overrides = {}
    }: UpdateMinOrderAmountParams) {
        const args = [tokenAddress, minOrderAmount];
        return this.genidex.writeContract({
            signer,
            method: 'updateMinOrderAmount',
            args,
            overrides
        });
    }

    async updateMinTransferAmount({
        signer,
        tokenAddress,
        minTransferAmount,
        overrides = {}
    }: UpdateMinTransferAmountParams) {
        const args = [tokenAddress, minTransferAmount];
        return this.genidex.writeContract({
            signer,
            method: 'updateMinTransferAmount',
            args,
            overrides
        });
    }

    async updateMarketIsRewardable({
        signer,
        marketId,
        isRewardable,
        overrides = {}
    }: UpdateMarketIsRewardableParams) {
        const args = [marketId, isRewardable];
        return this.genidex.writeContract({
            signer,
            method: 'updateMarketIsRewardable',
            args,
            overrides
        });
    }

    // readContract
    async getFeeReceiver(){
        return this.genidex.readContract('getUserAddress', [constants.FEE_USER_ID]);
    }

    async getAuthority(){
        return this.genidex.readContract('authority');
    }

}
