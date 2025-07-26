import {Networks, RawNetworks} from "../types.js";
import {networks} from '../config/networks.js';

class Config {

    public networks: Networks = {};

    constructor(){
        this.networks = this.parseRawNetworks(networks);
    }

    parseRawNetworks(raw: RawNetworks): Networks {
        const result: Networks = {};
        for (const [name, config] of Object.entries(raw)) {
            result[name] = {
                chainId: BigInt(config.chainId),
                name: name,
                contracts: config.contracts
            };
        }
        return result;
    }

    getNetwork(name: string) {
        const network = this.networks[name];
        if (!network) {
            throw new Error(`Network "${name}" does not exist.`);
        }
        return network;
    }
}
export const config = new Config();