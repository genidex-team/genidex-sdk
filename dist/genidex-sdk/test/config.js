import "@genidex/logger";
import { ethers } from "ethers";
import { NetworkName } from "../src";
class Config {
    constructor() {
        // rpc = 'http://127.0.0.1:8545';
        this.rpc = 'https://rpc.genidex.net';
        this.provider = new ethers.JsonRpcProvider(this.rpc);
        // rpc = 'ws://127.0.0.1:8545';
        // provider = new ethers.WebSocketProvider(this.rpc);
        this.networkName = NetworkName.Geni;
    }
    async getSigner() {
        return this.provider.getSigner(1);
    }
}
export const config = new Config();
//# sourceMappingURL=config.js.map