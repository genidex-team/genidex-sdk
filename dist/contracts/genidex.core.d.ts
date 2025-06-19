import { Contract } from "ethers";
export declare class GeniDexCore {
    contractAddress: string;
    provider: any;
    contract: Contract;
    address: string;
    abi: any;
    constructor(contractAddress: string, provider: any);
}
