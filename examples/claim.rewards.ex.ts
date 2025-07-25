
import { GeniDex, NetworkName, utils } from "../src/index";
import {Rewarder} from "../src/rewarder";
import {RewardSystemInfo, UserRewardInfo} from "../src/rewarder/rewarder.types";
import { ethers, formatEther, parseEther, Signature, Signer } from "ethers";
import { config } from "../test/config";
import { error } from "console";

let rewarder  = new Rewarder();
let signer: Signer;
let signerAddress: string;
let provider = config.provider;

async function main(){
    console.log('rewarder')
    signer = await config.getSigner();
    signerAddress = await signer.getAddress();
    await rewarder.connect(config.networkName, provider);

    await provider.send("evm_mine", []);

    const systemInfo = await rewarder.getRewardSystemInfo();
    // console.log( systemInfo );
    printSystemInfo(systemInfo);

    const userInfo = await rewarder.getUserRewardInfo(signerAddress);
    printUserInfo( userInfo );

    await rewarder.claim({signer, pointsToClaim: utils.parseBaseUnit(4000)});

    const userInfo2 = await rewarder.getUserRewardInfo(signerAddress);
    printUserInfo( userInfo2 );

    // return;

}

function printSystemInfo(info: RewardSystemInfo){
    const formatted = {
        epoch: info.epoch,
        startTime: info.startTime,
        timeSinceStart: utils.formatTimeDiff(info.startTime),
        pointsPerGENI: utils.formatBaseUnit(info.pointsPerGENI),
        totalUnlockable: utils.formatBaseUnit(info.totalUnlockable),
        unlockedTokens: utils.formatBaseUnit(info.unlockedTokens),
        distributedTokens: utils.formatBaseUnit(info.distributedTokens),
        availableTokens: utils.formatBaseUnit(info.availableTokens),
        unclaimedPoints: utils.formatBaseUnit(info.unclaimedPoints),
        geniBalance: utils.formatBaseUnit(info.geniBalance)
    };
    console.log(formatted);
};

function printUserInfo(info: UserRewardInfo){
    const formatted = {
        tradingPoints: utils.formatBaseUnit(info.tradingPoints),
        refPoints: utils.formatBaseUnit(info.refPoints),
        estimatedReward: utils.formatBaseUnit(info.estimatedReward),
        totalClaimed: utils.formatBaseUnit(info.totalClaimed),
        pointsPerGENI: utils.formatBaseUnit(info.pointsPerGENI)
    };
    // console.log(info);
    console.log(formatted);
};

main();