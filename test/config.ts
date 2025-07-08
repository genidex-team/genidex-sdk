import "@genidex/logger";
import { ethers } from "ethers";
import { NetworkName } from "../src";

class Config {

    rpc = 'http://127.0.0.1:8545';
    // rpc = 'https://rpc.genidex.net';
    provider = new ethers.JsonRpcProvider(this.rpc);

    // rpc = 'ws://127.0.0.1:8545';
    // provider = new ethers.WebSocketProvider(this.rpc);


    networkName = NetworkName.Localhost;

    constructor(){

    }

    async getSigner(){
        return this.provider.getSigner(2);
    }

    async getOwner(){
        return this.provider.getSigner(0);
    }

}

export const config = new Config()