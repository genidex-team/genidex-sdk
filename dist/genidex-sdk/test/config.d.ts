import "@genidex/logger";
import { ethers } from "ethers";
import { NetworkName } from "../src";
declare class Config {
    rpc: string;
    provider: ethers.JsonRpcProvider;
    networkName: NetworkName;
    constructor();
    getSigner(): Promise<ethers.JsonRpcSigner>;
}
export declare const config: Config;
export {};
