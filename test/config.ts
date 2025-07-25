import "@genidex/logger";
import { ethers } from "ethers";
import { NetworkName } from "../src";

class Config {

    // rpc = 'http://127.0.0.1:8545';
    rpc = 'https://rpc.genidex.net';
    provider = new ethers.JsonRpcProvider(this.rpc);

    // rpc = 'ws://127.0.0.1:8545';
    // provider = new ethers.WebSocketProvider(this.rpc);

    networkName = NetworkName.Geni;

    constructor(){

    }

    async getSigner(index: number=0){
        return this.provider.getSigner(index);
    }

    async getOwner(){
        return this.provider.getSigner(0);
    }

}

export const config = new Config()