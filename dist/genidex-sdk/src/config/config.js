import rawNetworks from '../config/networks.json';
class Config {
    constructor() {
        this.networks = {};
        this.networks = this.parseRawNetworks(rawNetworks);
    }
    parseRawNetworks(raw) {
        const result = {};
        for (const [name, config] of Object.entries(raw)) {
            result[name] = {
                chainId: BigInt(config.chainId),
                name: name,
                contracts: config.contracts
            };
        }
        return result;
    }
    getNetwork(name) {
        const network = this.networks[name];
        if (!network) {
            throw new Error(`Network "${name}" does not exist.`);
        }
        return network;
    }
}
export const config = new Config();
//# sourceMappingURL=config.js.map