import { Networks, RawNetworks } from "../types";
declare class Config {
    networks: Networks;
    constructor();
    parseRawNetworks(raw: RawNetworks): Networks;
    getNetwork(name: string): import("../types").NetworkConfig;
}
export declare const config: Config;
export {};
