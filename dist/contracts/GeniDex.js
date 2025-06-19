import { Contract, getAddress, ZeroAddress } from 'ethers';
import abi from './abi/GeniDex.json';
export class GeniDexContract {
    constructor(address, providerOrSigner) {
        this.ETH_ADDRESS = ZeroAddress;
        this.contract = new Contract(getAddress(address), abi, providerOrSigner);
    }
    async getUserReferrer(user) {
        return await this.contract.userReferrer(getAddress(user));
    }
    async getAllMarkets() {
        var markets = {};
        const marketData = await this.contract.getAllMarkets();
        for (var i in marketData) {
            let item = marketData[i];
            markets[item.id] = {
                id: parseInt(item.id),
                symbol: item.symbol,
                price: item.price,
                lastUpdatePrice: item.lastUpdatePrice,
                baseAddress: item.baseAddress,
                quoteAddress: item.quoteAddress,
                creator: item.creator,
                isRewardable: item.isRewardable
            };
        }
        return markets;
    }
}
