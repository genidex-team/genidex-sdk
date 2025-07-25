import { BigNumberish, Overrides, Signer } from "ethers";

export interface RewardSystemInfo {
  epoch: bigint;
  pointsPerGENI: bigint;
  startTime: bigint;
  totalUnlockable: bigint;
  unlockedTokens: bigint;
  distributedTokens: bigint;
  totalDistributedInPrevEpochs: bigint;
  availableTokens: bigint;
  unclaimedPoints: bigint;
  geniBalance: bigint;
}

export interface UserRewardInfo {
  tradingPoints: bigint;
  refPoints: bigint;
  estimatedReward: bigint;
  totalClaimed: bigint;
  pointsPerGENI: bigint;
}

export interface claimParams{
    signer: Signer;
    pointsToClaim: BigNumberish;
    overrides?: Overrides;
}