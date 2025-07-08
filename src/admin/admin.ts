
import { BigNumberish, Contract, ContractTransactionResponse, getBigInt, Signer, TransactionReceipt, TransactionResponse, ZeroAddress } from 'ethers';
import { GeniDex } from '../contracts/genidex';
import { MarketMap, Orders } from '../types';
import { utils } from '../utils';
import './admin.types';
import { AddMarketParams, ListTokenParams, WriteContractParams } from './admin.types';
import { constants } from '../constants';


export class Admin {
    genidex!: GeniDex;
    contract: Contract;
    buyOrders: Orders = {};
    sellOrders: Orders = {};
    markets: MarketMap = {}

    constructor(_genidex: GeniDex) {
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

    async getFeeReceiver(){
        return this.genidex.readContract('userAddresses', [constants.FEE_USER_ID]);
    }

    async updateFeeReceiver({
        signer,
        args = [],
        overrides = {}
    }: WriteContractParams){
        return this.genidex.writeContract({
            signer,
            method: 'updateFeeReceiver',
            args: args,
            overrides: overrides
        })
    }

}
