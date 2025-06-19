import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "./common";
export declare namespace Storage {
    type MarketStruct = {
        symbol: string;
        id: BigNumberish;
        price: BigNumberish;
        lastUpdatePrice: BigNumberish;
        baseAddress: AddressLike;
        quoteAddress: AddressLike;
        creator: AddressLike;
        isRewardable: boolean;
    };
    type MarketStructOutput = [
        symbol: string,
        id: bigint,
        price: bigint,
        lastUpdatePrice: bigint,
        baseAddress: string,
        quoteAddress: string,
        creator: string,
        isRewardable: boolean
    ] & {
        symbol: string;
        id: bigint;
        price: bigint;
        lastUpdatePrice: bigint;
        baseAddress: string;
        quoteAddress: string;
        creator: string;
        isRewardable: boolean;
    };
    type OutputOrderStruct = {
        id: BigNumberish;
        trader: AddressLike;
        price: BigNumberish;
        quantity: BigNumberish;
    };
    type OutputOrderStructOutput = [
        id: bigint,
        trader: string,
        price: bigint,
        quantity: bigint
    ] & {
        id: bigint;
        trader: string;
        price: bigint;
        quantity: bigint;
    };
    type OrderStruct = {
        trader: AddressLike;
        price: BigNumberish;
        quantity: BigNumberish;
    };
    type OrderStructOutput = [
        trader: string,
        price: bigint,
        quantity: bigint
    ] & {
        trader: string;
        price: bigint;
        quantity: bigint;
    };
}
export declare namespace Tokens {
    type TokenInfoStruct = {
        tokenAddress: AddressLike;
        symbol: string;
        usdMarketID: BigNumberish;
        minOrderAmount: BigNumberish;
        minTransferAmount: BigNumberish;
        decimals: BigNumberish;
        isUSD: boolean;
    };
    type TokenInfoStructOutput = [
        tokenAddress: string,
        symbol: string,
        usdMarketID: bigint,
        minOrderAmount: bigint,
        minTransferAmount: bigint,
        decimals: bigint,
        isUSD: boolean
    ] & {
        tokenAddress: string;
        symbol: string;
        usdMarketID: bigint;
        minOrderAmount: bigint;
        minTransferAmount: bigint;
        decimals: bigint;
        isUSD: boolean;
    };
}
export interface GeniDexInterface extends Interface {
    getFunction(nameOrSignature: "UPGRADE_INTERFACE_VERSION" | "WAD" | "addMarket" | "balances" | "buyOrders" | "cancelBuyOrder" | "cancelSellOrder" | "deductUserPoints" | "depositEth" | "depositToken" | "feeReceiver" | "generateMarketHash" | "geniRewarder" | "getAllMarkets" | "getAndSetTokenMeta" | "getBuyOrders(uint256,uint256)" | "getBuyOrders(uint256)" | "getEthBalance" | "getMarket" | "getMarketID" | "getReferees" | "getReferrer" | "getSellOrders(uint256)" | "getSellOrders(uint256,uint256)" | "getTokenBalance" | "getTokensInfo" | "getTotalUnclaimedPoints" | "getUserPoints" | "initialize" | "marketCounter" | "marketIDs" | "markets" | "migrateReferees" | "owner" | "pause" | "paused" | "placeBuyOrder" | "placeSellOrder" | "pointDecimals" | "proxiableUUID" | "refereesOf" | "referralRoot" | "renounceOwnership" | "sellOrders" | "setGeniRewarder" | "setReferralRoot" | "setReferrer" | "tokens" | "totalUnclaimedPoints" | "transferOwnership" | "unpause" | "updateMarketIsRewardable" | "updateMinOrderAmount" | "updateMinTransferAmount" | "updateTokenIsUSD" | "updateUSDMarketID" | "upgradeToAndCall" | "userPoints" | "userReferrer" | "withdrawEth" | "withdrawToken"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "Deposit" | "GeniRewarderUpdated" | "Initialized" | "OnPlaceBuyOrder" | "OnPlaceSellOrder" | "OwnershipTransferred" | "Paused" | "Unpaused" | "Upgraded" | "Withdrawal"): EventFragment;
    encodeFunctionData(functionFragment: "UPGRADE_INTERFACE_VERSION", values?: undefined): string;
    encodeFunctionData(functionFragment: "WAD", values?: undefined): string;
    encodeFunctionData(functionFragment: "addMarket", values: [AddressLike, AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "balances", values: [AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "buyOrders", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "cancelBuyOrder", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "cancelSellOrder", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "deductUserPoints", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "depositEth", values?: undefined): string;
    encodeFunctionData(functionFragment: "depositToken", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "feeReceiver", values?: undefined): string;
    encodeFunctionData(functionFragment: "generateMarketHash", values: [AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "geniRewarder", values?: undefined): string;
    encodeFunctionData(functionFragment: "getAllMarkets", values?: undefined): string;
    encodeFunctionData(functionFragment: "getAndSetTokenMeta", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "getBuyOrders(uint256,uint256)", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getBuyOrders(uint256)", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getEthBalance", values?: undefined): string;
    encodeFunctionData(functionFragment: "getMarket", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getMarketID", values: [AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "getReferees", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "getReferrer", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "getSellOrders(uint256)", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getSellOrders(uint256,uint256)", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getTokenBalance", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "getTokensInfo", values: [AddressLike[]]): string;
    encodeFunctionData(functionFragment: "getTotalUnclaimedPoints", values?: undefined): string;
    encodeFunctionData(functionFragment: "getUserPoints", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "initialize", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "marketCounter", values?: undefined): string;
    encodeFunctionData(functionFragment: "marketIDs", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "markets", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "migrateReferees", values: [BytesLike[], AddressLike[]]): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "pause", values?: undefined): string;
    encodeFunctionData(functionFragment: "paused", values?: undefined): string;
    encodeFunctionData(functionFragment: "placeBuyOrder", values: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish[],
        AddressLike
    ]): string;
    encodeFunctionData(functionFragment: "placeSellOrder", values: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish[],
        AddressLike
    ]): string;
    encodeFunctionData(functionFragment: "pointDecimals", values?: undefined): string;
    encodeFunctionData(functionFragment: "proxiableUUID", values?: undefined): string;
    encodeFunctionData(functionFragment: "refereesOf", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "referralRoot", values?: undefined): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "sellOrders", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "setGeniRewarder", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "setReferralRoot", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "setReferrer", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "tokens", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "totalUnclaimedPoints", values?: undefined): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
    encodeFunctionData(functionFragment: "updateMarketIsRewardable", values: [BigNumberish, boolean]): string;
    encodeFunctionData(functionFragment: "updateMinOrderAmount", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "updateMinTransferAmount", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "updateTokenIsUSD", values: [AddressLike, boolean]): string;
    encodeFunctionData(functionFragment: "updateUSDMarketID", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "upgradeToAndCall", values: [AddressLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "userPoints", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "userReferrer", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "withdrawEth", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "withdrawToken", values: [AddressLike, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "UPGRADE_INTERFACE_VERSION", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "WAD", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addMarket", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balances", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "buyOrders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cancelBuyOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cancelSellOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deductUserPoints", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositEth", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "feeReceiver", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "generateMarketHash", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "geniRewarder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAllMarkets", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAndSetTokenMeta", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getBuyOrders(uint256,uint256)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getBuyOrders(uint256)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getEthBalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getMarket", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getMarketID", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getReferees", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getReferrer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSellOrders(uint256)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSellOrders(uint256,uint256)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTokenBalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTokensInfo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalUnclaimedPoints", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getUserPoints", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "marketCounter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "marketIDs", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "markets", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "migrateReferees", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "placeBuyOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "placeSellOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pointDecimals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proxiableUUID", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "refereesOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "referralRoot", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "sellOrders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setGeniRewarder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setReferralRoot", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setReferrer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalUnclaimedPoints", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateMarketIsRewardable", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateMinOrderAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateMinTransferAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateTokenIsUSD", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateUSDMarketID", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "upgradeToAndCall", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "userPoints", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "userReferrer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawEth", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawToken", data: BytesLike): Result;
}
export declare namespace DepositEvent {
    type InputTuple = [
        sender: AddressLike,
        token: AddressLike,
        amount: BigNumberish
    ];
    type OutputTuple = [sender: string, token: string, amount: bigint];
    interface OutputObject {
        sender: string;
        token: string;
        amount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace GeniRewarderUpdatedEvent {
    type InputTuple = [previous: AddressLike, newRewarder: AddressLike];
    type OutputTuple = [previous: string, newRewarder: string];
    interface OutputObject {
        previous: string;
        newRewarder: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace InitializedEvent {
    type InputTuple = [version: BigNumberish];
    type OutputTuple = [version: bigint];
    interface OutputObject {
        version: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace OnPlaceBuyOrderEvent {
    type InputTuple = [
        marketId: BigNumberish,
        trader: AddressLike,
        orderIndex: BigNumberish,
        price: BigNumberish,
        quantity: BigNumberish,
        remainingQuantity: BigNumberish,
        lastPrice: BigNumberish,
        referrer: AddressLike
    ];
    type OutputTuple = [
        marketId: bigint,
        trader: string,
        orderIndex: bigint,
        price: bigint,
        quantity: bigint,
        remainingQuantity: bigint,
        lastPrice: bigint,
        referrer: string
    ];
    interface OutputObject {
        marketId: bigint;
        trader: string;
        orderIndex: bigint;
        price: bigint;
        quantity: bigint;
        remainingQuantity: bigint;
        lastPrice: bigint;
        referrer: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace OnPlaceSellOrderEvent {
    type InputTuple = [
        marketId: BigNumberish,
        trader: AddressLike,
        orderIndex: BigNumberish,
        price: BigNumberish,
        quantity: BigNumberish,
        remainingQuantity: BigNumberish,
        lastPrice: BigNumberish,
        referrer: AddressLike
    ];
    type OutputTuple = [
        marketId: bigint,
        trader: string,
        orderIndex: bigint,
        price: bigint,
        quantity: bigint,
        remainingQuantity: bigint,
        lastPrice: bigint,
        referrer: string
    ];
    interface OutputObject {
        marketId: bigint;
        trader: string;
        orderIndex: bigint;
        price: bigint;
        quantity: bigint;
        remainingQuantity: bigint;
        lastPrice: bigint;
        referrer: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace OwnershipTransferredEvent {
    type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
    type OutputTuple = [previousOwner: string, newOwner: string];
    interface OutputObject {
        previousOwner: string;
        newOwner: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace PausedEvent {
    type InputTuple = [account: AddressLike];
    type OutputTuple = [account: string];
    interface OutputObject {
        account: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace UnpausedEvent {
    type InputTuple = [account: AddressLike];
    type OutputTuple = [account: string];
    interface OutputObject {
        account: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace UpgradedEvent {
    type InputTuple = [implementation: AddressLike];
    type OutputTuple = [implementation: string];
    interface OutputObject {
        implementation: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace WithdrawalEvent {
    type InputTuple = [
        recipient: AddressLike,
        token: AddressLike,
        amount: BigNumberish
    ];
    type OutputTuple = [recipient: string, token: string, amount: bigint];
    interface OutputObject {
        recipient: string;
        token: string;
        amount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface GeniDex extends BaseContract {
    connect(runner?: ContractRunner | null): GeniDex;
    waitForDeployment(): Promise<this>;
    interface: GeniDexInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    UPGRADE_INTERFACE_VERSION: TypedContractMethod<[], [string], "view">;
    WAD: TypedContractMethod<[], [bigint], "view">;
    addMarket: TypedContractMethod<[
        baseAddress: AddressLike,
        quoteAddress: AddressLike,
        minOrderAmount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    balances: TypedContractMethod<[
        arg0: AddressLike,
        arg1: AddressLike
    ], [
        bigint
    ], "view">;
    buyOrders: TypedContractMethod<[
        arg0: BigNumberish,
        arg1: BigNumberish
    ], [
        [
            string,
            bigint,
            bigint
        ] & {
            trader: string;
            price: bigint;
            quantity: bigint;
        }
    ], "view">;
    cancelBuyOrder: TypedContractMethod<[
        marketId: BigNumberish,
        orderIndex: BigNumberish
    ], [
        void
    ], "nonpayable">;
    cancelSellOrder: TypedContractMethod<[
        marketId: BigNumberish,
        orderIndex: BigNumberish
    ], [
        void
    ], "nonpayable">;
    deductUserPoints: TypedContractMethod<[
        user: AddressLike,
        pointsToDeduct: BigNumberish
    ], [
        void
    ], "nonpayable">;
    depositEth: TypedContractMethod<[], [void], "payable">;
    depositToken: TypedContractMethod<[
        tokenAddress: AddressLike,
        normalizedAmount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    feeReceiver: TypedContractMethod<[], [string], "view">;
    generateMarketHash: TypedContractMethod<[
        baseAddress: AddressLike,
        quoteAddress: AddressLike
    ], [
        string
    ], "view">;
    geniRewarder: TypedContractMethod<[], [string], "view">;
    getAllMarkets: TypedContractMethod<[
    ], [
        Storage.MarketStructOutput[]
    ], "view">;
    getAndSetTokenMeta: TypedContractMethod<[
        tokenAddress: AddressLike
    ], [
        [string, bigint] & {
            symbol: string;
            decimals: bigint;
        }
    ], "nonpayable">;
    "getBuyOrders(uint256,uint256)": TypedContractMethod<[
        marketId: BigNumberish,
        minPrice: BigNumberish
    ], [
        Storage.OutputOrderStructOutput[]
    ], "view">;
    "getBuyOrders(uint256)": TypedContractMethod<[
        marketId: BigNumberish
    ], [
        Storage.OrderStructOutput[]
    ], "view">;
    getEthBalance: TypedContractMethod<[], [bigint], "view">;
    getMarket: TypedContractMethod<[
        id: BigNumberish
    ], [
        Storage.MarketStructOutput
    ], "view">;
    getMarketID: TypedContractMethod<[
        baseAddress: AddressLike,
        quoteAddress: AddressLike
    ], [
        bigint
    ], "view">;
    getReferees: TypedContractMethod<[referrer: AddressLike], [string[]], "view">;
    getReferrer: TypedContractMethod<[referee: AddressLike], [string], "view">;
    "getSellOrders(uint256)": TypedContractMethod<[
        marketId: BigNumberish
    ], [
        Storage.OrderStructOutput[]
    ], "view">;
    "getSellOrders(uint256,uint256)": TypedContractMethod<[
        marketId: BigNumberish,
        maxPrice: BigNumberish
    ], [
        Storage.OutputOrderStructOutput[]
    ], "view">;
    getTokenBalance: TypedContractMethod<[
        tokenAddress: AddressLike
    ], [
        bigint
    ], "view">;
    getTokensInfo: TypedContractMethod<[
        tokenAddresses: AddressLike[]
    ], [
        Tokens.TokenInfoStructOutput[]
    ], "view">;
    getTotalUnclaimedPoints: TypedContractMethod<[], [bigint], "view">;
    getUserPoints: TypedContractMethod<[user: AddressLike], [bigint], "view">;
    initialize: TypedContractMethod<[
        initialOwner: AddressLike
    ], [
        void
    ], "nonpayable">;
    marketCounter: TypedContractMethod<[], [bigint], "view">;
    marketIDs: TypedContractMethod<[arg0: BytesLike], [bigint], "view">;
    markets: TypedContractMethod<[
        arg0: BigNumberish
    ], [
        [
            string,
            bigint,
            bigint,
            bigint,
            string,
            string,
            string,
            boolean
        ] & {
            symbol: string;
            id: bigint;
            price: bigint;
            lastUpdatePrice: bigint;
            baseAddress: string;
            quoteAddress: string;
            creator: string;
            isRewardable: boolean;
        }
    ], "view">;
    migrateReferees: TypedContractMethod<[
        proof: BytesLike[],
        referees: AddressLike[]
    ], [
        void
    ], "nonpayable">;
    owner: TypedContractMethod<[], [string], "view">;
    pause: TypedContractMethod<[], [void], "nonpayable">;
    paused: TypedContractMethod<[], [boolean], "view">;
    placeBuyOrder: TypedContractMethod<[
        marketId: BigNumberish,
        price: BigNumberish,
        quantity: BigNumberish,
        filledOrderId: BigNumberish,
        sellOrderIDs: BigNumberish[],
        referrer: AddressLike
    ], [
        void
    ], "nonpayable">;
    placeSellOrder: TypedContractMethod<[
        marketId: BigNumberish,
        price: BigNumberish,
        quantity: BigNumberish,
        filledOrderId: BigNumberish,
        buyOrderIDs: BigNumberish[],
        referrer: AddressLike
    ], [
        void
    ], "nonpayable">;
    pointDecimals: TypedContractMethod<[], [bigint], "view">;
    proxiableUUID: TypedContractMethod<[], [string], "view">;
    refereesOf: TypedContractMethod<[
        arg0: AddressLike,
        arg1: BigNumberish
    ], [
        string
    ], "view">;
    referralRoot: TypedContractMethod<[], [string], "view">;
    renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;
    sellOrders: TypedContractMethod<[
        arg0: BigNumberish,
        arg1: BigNumberish
    ], [
        [
            string,
            bigint,
            bigint
        ] & {
            trader: string;
            price: bigint;
            quantity: bigint;
        }
    ], "view">;
    setGeniRewarder: TypedContractMethod<[
        _rewarder: AddressLike
    ], [
        void
    ], "nonpayable">;
    setReferralRoot: TypedContractMethod<[
        _referralRoot: BytesLike
    ], [
        void
    ], "nonpayable">;
    setReferrer: TypedContractMethod<[
        _referrer: AddressLike
    ], [
        void
    ], "nonpayable">;
    tokens: TypedContractMethod<[
        arg0: AddressLike
    ], [
        [
            string,
            bigint,
            bigint,
            bigint,
            bigint,
            boolean
        ] & {
            symbol: string;
            usdMarketID: bigint;
            minOrderAmount: bigint;
            minTransferAmount: bigint;
            decimals: bigint;
            isUSD: boolean;
        }
    ], "view">;
    totalUnclaimedPoints: TypedContractMethod<[], [bigint], "view">;
    transferOwnership: TypedContractMethod<[
        newOwner: AddressLike
    ], [
        void
    ], "nonpayable">;
    unpause: TypedContractMethod<[], [void], "nonpayable">;
    updateMarketIsRewardable: TypedContractMethod<[
        marketId: BigNumberish,
        isRewardable: boolean
    ], [
        void
    ], "nonpayable">;
    updateMinOrderAmount: TypedContractMethod<[
        tokenAddress: AddressLike,
        minOrderAmount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    updateMinTransferAmount: TypedContractMethod<[
        tokenAddress: AddressLike,
        minTransferAmount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    updateTokenIsUSD: TypedContractMethod<[
        tokenAddress: AddressLike,
        isUSD: boolean
    ], [
        void
    ], "nonpayable">;
    updateUSDMarketID: TypedContractMethod<[
        tokenAddress: AddressLike,
        marketID: BigNumberish
    ], [
        void
    ], "nonpayable">;
    upgradeToAndCall: TypedContractMethod<[
        newImplementation: AddressLike,
        data: BytesLike
    ], [
        void
    ], "payable">;
    userPoints: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
    userReferrer: TypedContractMethod<[arg0: AddressLike], [string], "view">;
    withdrawEth: TypedContractMethod<[
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    withdrawToken: TypedContractMethod<[
        tokenAddress: AddressLike,
        normalizedAmount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "UPGRADE_INTERFACE_VERSION"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "WAD"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "addMarket"): TypedContractMethod<[
        baseAddress: AddressLike,
        quoteAddress: AddressLike,
        minOrderAmount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "balances"): TypedContractMethod<[
        arg0: AddressLike,
        arg1: AddressLike
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "buyOrders"): TypedContractMethod<[
        arg0: BigNumberish,
        arg1: BigNumberish
    ], [
        [
            string,
            bigint,
            bigint
        ] & {
            trader: string;
            price: bigint;
            quantity: bigint;
        }
    ], "view">;
    getFunction(nameOrSignature: "cancelBuyOrder"): TypedContractMethod<[
        marketId: BigNumberish,
        orderIndex: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "cancelSellOrder"): TypedContractMethod<[
        marketId: BigNumberish,
        orderIndex: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "deductUserPoints"): TypedContractMethod<[
        user: AddressLike,
        pointsToDeduct: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "depositEth"): TypedContractMethod<[], [void], "payable">;
    getFunction(nameOrSignature: "depositToken"): TypedContractMethod<[
        tokenAddress: AddressLike,
        normalizedAmount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "feeReceiver"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "generateMarketHash"): TypedContractMethod<[
        baseAddress: AddressLike,
        quoteAddress: AddressLike
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "geniRewarder"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getAllMarkets"): TypedContractMethod<[], [Storage.MarketStructOutput[]], "view">;
    getFunction(nameOrSignature: "getAndSetTokenMeta"): TypedContractMethod<[
        tokenAddress: AddressLike
    ], [
        [string, bigint] & {
            symbol: string;
            decimals: bigint;
        }
    ], "nonpayable">;
    getFunction(nameOrSignature: "getBuyOrders(uint256,uint256)"): TypedContractMethod<[
        marketId: BigNumberish,
        minPrice: BigNumberish
    ], [
        Storage.OutputOrderStructOutput[]
    ], "view">;
    getFunction(nameOrSignature: "getBuyOrders(uint256)"): TypedContractMethod<[
        marketId: BigNumberish
    ], [
        Storage.OrderStructOutput[]
    ], "view">;
    getFunction(nameOrSignature: "getEthBalance"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getMarket"): TypedContractMethod<[
        id: BigNumberish
    ], [
        Storage.MarketStructOutput
    ], "view">;
    getFunction(nameOrSignature: "getMarketID"): TypedContractMethod<[
        baseAddress: AddressLike,
        quoteAddress: AddressLike
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "getReferees"): TypedContractMethod<[referrer: AddressLike], [string[]], "view">;
    getFunction(nameOrSignature: "getReferrer"): TypedContractMethod<[referee: AddressLike], [string], "view">;
    getFunction(nameOrSignature: "getSellOrders(uint256)"): TypedContractMethod<[
        marketId: BigNumberish
    ], [
        Storage.OrderStructOutput[]
    ], "view">;
    getFunction(nameOrSignature: "getSellOrders(uint256,uint256)"): TypedContractMethod<[
        marketId: BigNumberish,
        maxPrice: BigNumberish
    ], [
        Storage.OutputOrderStructOutput[]
    ], "view">;
    getFunction(nameOrSignature: "getTokenBalance"): TypedContractMethod<[tokenAddress: AddressLike], [bigint], "view">;
    getFunction(nameOrSignature: "getTokensInfo"): TypedContractMethod<[
        tokenAddresses: AddressLike[]
    ], [
        Tokens.TokenInfoStructOutput[]
    ], "view">;
    getFunction(nameOrSignature: "getTotalUnclaimedPoints"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getUserPoints"): TypedContractMethod<[user: AddressLike], [bigint], "view">;
    getFunction(nameOrSignature: "initialize"): TypedContractMethod<[initialOwner: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "marketCounter"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "marketIDs"): TypedContractMethod<[arg0: BytesLike], [bigint], "view">;
    getFunction(nameOrSignature: "markets"): TypedContractMethod<[
        arg0: BigNumberish
    ], [
        [
            string,
            bigint,
            bigint,
            bigint,
            string,
            string,
            string,
            boolean
        ] & {
            symbol: string;
            id: bigint;
            price: bigint;
            lastUpdatePrice: bigint;
            baseAddress: string;
            quoteAddress: string;
            creator: string;
            isRewardable: boolean;
        }
    ], "view">;
    getFunction(nameOrSignature: "migrateReferees"): TypedContractMethod<[
        proof: BytesLike[],
        referees: AddressLike[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "owner"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "pause"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "paused"): TypedContractMethod<[], [boolean], "view">;
    getFunction(nameOrSignature: "placeBuyOrder"): TypedContractMethod<[
        marketId: BigNumberish,
        price: BigNumberish,
        quantity: BigNumberish,
        filledOrderId: BigNumberish,
        sellOrderIDs: BigNumberish[],
        referrer: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "placeSellOrder"): TypedContractMethod<[
        marketId: BigNumberish,
        price: BigNumberish,
        quantity: BigNumberish,
        filledOrderId: BigNumberish,
        buyOrderIDs: BigNumberish[],
        referrer: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "pointDecimals"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "proxiableUUID"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "refereesOf"): TypedContractMethod<[
        arg0: AddressLike,
        arg1: BigNumberish
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "referralRoot"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "renounceOwnership"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "sellOrders"): TypedContractMethod<[
        arg0: BigNumberish,
        arg1: BigNumberish
    ], [
        [
            string,
            bigint,
            bigint
        ] & {
            trader: string;
            price: bigint;
            quantity: bigint;
        }
    ], "view">;
    getFunction(nameOrSignature: "setGeniRewarder"): TypedContractMethod<[_rewarder: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "setReferralRoot"): TypedContractMethod<[_referralRoot: BytesLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "setReferrer"): TypedContractMethod<[_referrer: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "tokens"): TypedContractMethod<[
        arg0: AddressLike
    ], [
        [
            string,
            bigint,
            bigint,
            bigint,
            bigint,
            boolean
        ] & {
            symbol: string;
            usdMarketID: bigint;
            minOrderAmount: bigint;
            minTransferAmount: bigint;
            decimals: bigint;
            isUSD: boolean;
        }
    ], "view">;
    getFunction(nameOrSignature: "totalUnclaimedPoints"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "transferOwnership"): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "unpause"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "updateMarketIsRewardable"): TypedContractMethod<[
        marketId: BigNumberish,
        isRewardable: boolean
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "updateMinOrderAmount"): TypedContractMethod<[
        tokenAddress: AddressLike,
        minOrderAmount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "updateMinTransferAmount"): TypedContractMethod<[
        tokenAddress: AddressLike,
        minTransferAmount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "updateTokenIsUSD"): TypedContractMethod<[
        tokenAddress: AddressLike,
        isUSD: boolean
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "updateUSDMarketID"): TypedContractMethod<[
        tokenAddress: AddressLike,
        marketID: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "upgradeToAndCall"): TypedContractMethod<[
        newImplementation: AddressLike,
        data: BytesLike
    ], [
        void
    ], "payable">;
    getFunction(nameOrSignature: "userPoints"): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
    getFunction(nameOrSignature: "userReferrer"): TypedContractMethod<[arg0: AddressLike], [string], "view">;
    getFunction(nameOrSignature: "withdrawEth"): TypedContractMethod<[amount: BigNumberish], [void], "nonpayable">;
    getFunction(nameOrSignature: "withdrawToken"): TypedContractMethod<[
        tokenAddress: AddressLike,
        normalizedAmount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getEvent(key: "Deposit"): TypedContractEvent<DepositEvent.InputTuple, DepositEvent.OutputTuple, DepositEvent.OutputObject>;
    getEvent(key: "GeniRewarderUpdated"): TypedContractEvent<GeniRewarderUpdatedEvent.InputTuple, GeniRewarderUpdatedEvent.OutputTuple, GeniRewarderUpdatedEvent.OutputObject>;
    getEvent(key: "Initialized"): TypedContractEvent<InitializedEvent.InputTuple, InitializedEvent.OutputTuple, InitializedEvent.OutputObject>;
    getEvent(key: "OnPlaceBuyOrder"): TypedContractEvent<OnPlaceBuyOrderEvent.InputTuple, OnPlaceBuyOrderEvent.OutputTuple, OnPlaceBuyOrderEvent.OutputObject>;
    getEvent(key: "OnPlaceSellOrder"): TypedContractEvent<OnPlaceSellOrderEvent.InputTuple, OnPlaceSellOrderEvent.OutputTuple, OnPlaceSellOrderEvent.OutputObject>;
    getEvent(key: "OwnershipTransferred"): TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
    getEvent(key: "Paused"): TypedContractEvent<PausedEvent.InputTuple, PausedEvent.OutputTuple, PausedEvent.OutputObject>;
    getEvent(key: "Unpaused"): TypedContractEvent<UnpausedEvent.InputTuple, UnpausedEvent.OutputTuple, UnpausedEvent.OutputObject>;
    getEvent(key: "Upgraded"): TypedContractEvent<UpgradedEvent.InputTuple, UpgradedEvent.OutputTuple, UpgradedEvent.OutputObject>;
    getEvent(key: "Withdrawal"): TypedContractEvent<WithdrawalEvent.InputTuple, WithdrawalEvent.OutputTuple, WithdrawalEvent.OutputObject>;
    filters: {
        "Deposit(address,address,uint256)": TypedContractEvent<DepositEvent.InputTuple, DepositEvent.OutputTuple, DepositEvent.OutputObject>;
        Deposit: TypedContractEvent<DepositEvent.InputTuple, DepositEvent.OutputTuple, DepositEvent.OutputObject>;
        "GeniRewarderUpdated(address,address)": TypedContractEvent<GeniRewarderUpdatedEvent.InputTuple, GeniRewarderUpdatedEvent.OutputTuple, GeniRewarderUpdatedEvent.OutputObject>;
        GeniRewarderUpdated: TypedContractEvent<GeniRewarderUpdatedEvent.InputTuple, GeniRewarderUpdatedEvent.OutputTuple, GeniRewarderUpdatedEvent.OutputObject>;
        "Initialized(uint64)": TypedContractEvent<InitializedEvent.InputTuple, InitializedEvent.OutputTuple, InitializedEvent.OutputObject>;
        Initialized: TypedContractEvent<InitializedEvent.InputTuple, InitializedEvent.OutputTuple, InitializedEvent.OutputObject>;
        "OnPlaceBuyOrder(uint256,address,uint256,uint256,uint256,uint256,uint256,address)": TypedContractEvent<OnPlaceBuyOrderEvent.InputTuple, OnPlaceBuyOrderEvent.OutputTuple, OnPlaceBuyOrderEvent.OutputObject>;
        OnPlaceBuyOrder: TypedContractEvent<OnPlaceBuyOrderEvent.InputTuple, OnPlaceBuyOrderEvent.OutputTuple, OnPlaceBuyOrderEvent.OutputObject>;
        "OnPlaceSellOrder(uint256,address,uint256,uint256,uint256,uint256,uint256,address)": TypedContractEvent<OnPlaceSellOrderEvent.InputTuple, OnPlaceSellOrderEvent.OutputTuple, OnPlaceSellOrderEvent.OutputObject>;
        OnPlaceSellOrder: TypedContractEvent<OnPlaceSellOrderEvent.InputTuple, OnPlaceSellOrderEvent.OutputTuple, OnPlaceSellOrderEvent.OutputObject>;
        "OwnershipTransferred(address,address)": TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
        OwnershipTransferred: TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
        "Paused(address)": TypedContractEvent<PausedEvent.InputTuple, PausedEvent.OutputTuple, PausedEvent.OutputObject>;
        Paused: TypedContractEvent<PausedEvent.InputTuple, PausedEvent.OutputTuple, PausedEvent.OutputObject>;
        "Unpaused(address)": TypedContractEvent<UnpausedEvent.InputTuple, UnpausedEvent.OutputTuple, UnpausedEvent.OutputObject>;
        Unpaused: TypedContractEvent<UnpausedEvent.InputTuple, UnpausedEvent.OutputTuple, UnpausedEvent.OutputObject>;
        "Upgraded(address)": TypedContractEvent<UpgradedEvent.InputTuple, UpgradedEvent.OutputTuple, UpgradedEvent.OutputObject>;
        Upgraded: TypedContractEvent<UpgradedEvent.InputTuple, UpgradedEvent.OutputTuple, UpgradedEvent.OutputObject>;
        "Withdrawal(address,address,uint256)": TypedContractEvent<WithdrawalEvent.InputTuple, WithdrawalEvent.OutputTuple, WithdrawalEvent.OutputObject>;
        Withdrawal: TypedContractEvent<WithdrawalEvent.InputTuple, WithdrawalEvent.OutputTuple, WithdrawalEvent.OutputObject>;
    };
}
