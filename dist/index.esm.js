import { ethers, toBigInt, formatUnits, Contract, ZeroAddress, getBigInt, isAddress, Interface, ErrorDescription } from 'ethers';

const constants = {
    ETH_ADDRESS: ethers.ZeroAddress,
    WAD: ethers.parseEther("1")
};

class Utils {
    /**
     * Get on-chain balance of a user's ETH or ERC20 token.
     * @param provider - Ethers provider instance
     * @param userAddress - Address of the user
     * @param tokenAddress - ETH_ADDRESS or ERC20 token address
     * @returns Balance as bigint
     */
    async getNormBalance(provider, userAddress, tokenAddress, decimals) {
        if (tokenAddress === constants.ETH_ADDRESS) {
            // Native ETH balance
            return await provider.getBalance(userAddress);
        }
        else {
            // ERC20 balance
            const abi = ["function balanceOf(address) view returns (uint256)"];
            const contract = new ethers.Contract(tokenAddress, abi, provider);
            const rawBalance = await contract.balanceOf(userAddress);
            const normBalance = this.toNormAmount(rawBalance, decimals);
            return normBalance;
        }
    }
    /**
     * Convert token amount between different decimals.
     *
     * @param amount - Token amount in source decimals (as bigint or string).
     * @param fromDecimals - Source decimals (e.g. 6 for USDC).
     * @param toDecimals - Target decimals (e.g. 18 for normalized).
     * @returns Converted amount as bigint.
     */
    convertDecimals(amount, fromDecimals, toDecimals) {
        const value = typeof amount === "bigint" ? amount : BigInt(amount);
        if (fromDecimals === toDecimals)
            return value;
        const diff = toDecimals - fromDecimals;
        if (diff > 0) {
            return value * 10n ** BigInt(diff); // scale up
        }
        else {
            return value / 10n ** BigInt(-diff); // scale down
        }
    }
    /**
     * Converts an amount from the token's original decimals to the standard 18 decimals.
     *
     * @param rawAmount - The original amount (can be bigint, string, or BigNumberish).
     * @param tokenDecimals - The number of decimals the token uses (e.g., 6, 8, 18).
     * @returns The normalized amount as a bigint, scaled to 18 decimals.
     */
    toNormAmount(rawAmount, tokenDecimals) {
        return this.convertDecimals(rawAmount, tokenDecimals, 18);
    }
    /**
     * Converts a normalized amount (18 decimals) back to the token's original decimals.
     *
     * @param normAmount - The normalized amount (can be bigint, string, or BigNumberish).
     * @param tokenDecimals - The target decimals of the token.
     * @returns The raw amount as a bigint, scaled to the token's decimals.
     */
    toRawAmount(normAmount, tokenDecimals) {
        return this.convertDecimals(normAmount, 18, tokenDecimals);
    }
    /**
     * Format a normalized amount (with 18 decimals) into a human-readable string with commas.
     *
     * @param normAmount - The normalized amount (as `string`, `number`, or `bigint`).
     * @returns A formatted string with comma separators and fixed 18 decimal places.
     *
     * @example
     * formatNormAmount(1234567890000000000000n)
     * // => "1,234.567890000000000000"
     */
    formatNormAmount(normAmount) {
        const amount = typeof normAmount === 'bigint' ? normAmount : toBigInt(normAmount);
        const formatted = formatUnits(amount, 18); // returns a string
        let [intPart, decPart = ''] = formatted.split('.');
        decPart = decPart.padEnd(18, '0').slice(0, 18);
        intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${intPart}.${decPart}`;
    }
    jsonToString(obj) {
        return JSON.stringify(obj, (key, value) => typeof value === "bigint" ? value.toString() : value);
    }
    bigintReplacer(key, value) {
        return typeof value === "bigint" ? value.toString() : value;
    }
    errorDescriptionToString(error) {
        const errorFragment = error.fragment;
        const paramNames = errorFragment.inputs.map(input => input.name);
        const paramValues = error.args;
        const paramPairs = paramNames.map((name, index) => {
            const value = paramValues[index];
            let displayValue;
            if (typeof value === 'bigint') {
                displayValue = value.toString();
            }
            else if (typeof value === 'object') {
                displayValue = JSON.stringify(value, this.bigintReplacer);
            }
            else {
                displayValue = String(value);
            }
            return `${name}: ${displayValue}`;
        });
        return `${error.name}(${paramPairs.join(', ')})`;
    }
    logError(error) {
        console.error(error);
        for (const key in error) {
            error[key];
        }
        // console.error(objError);
        if (error.invocation && error.invocation.message)
            console.error('call:', error.invocation.message);
        if (error.reason)
            console.error('revert:', error.reason);
    }
}
const utils = new Utils;

var NetworkName;
(function (NetworkName) {
    NetworkName["Ethereum"] = "ethereum";
    NetworkName["Optimism"] = "optimism";
    NetworkName["Arbitrum"] = "arbitrum";
    NetworkName["Base"] = "base";
    // BNBChain = "bnb",
    // Polygon = "polygon",
    // Avalanche = "avalanche",
    // Testnet
    NetworkName["ArbSepolia"] = "arb_sepolia";
    NetworkName["OpSepolia"] = "op_sepolia";
    NetworkName["BaseSepolia"] = "base_sepolia";
    NetworkName["Sepolia"] = "sepolia";
    NetworkName["Hardhat"] = "hardhat";
    NetworkName["Localhost"] = "localhost";
    NetworkName["Geni"] = "geni";
})(NetworkName || (NetworkName = {}));

var abi = [
	{
		inputs: [
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "target",
				type: "address"
			}
		],
		name: "AddressEmptyCode",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "minAmount",
				type: "uint256"
			}
		],
		name: "AmountTooSmall",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "implementation",
				type: "address"
			}
		],
		name: "ERC1967InvalidImplementation",
		type: "error"
	},
	{
		inputs: [
		],
		name: "ERC1967NonPayable",
		type: "error"
	},
	{
		inputs: [
		],
		name: "EnforcedPause",
		type: "error"
	},
	{
		inputs: [
		],
		name: "ExpectedPause",
		type: "error"
	},
	{
		inputs: [
		],
		name: "FailedCall",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "available",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "required",
				type: "uint256"
			}
		],
		name: "InsufficientBalance",
		type: "error"
	},
	{
		inputs: [
		],
		name: "InvalidInitialization",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "marketId",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "marketCounter",
				type: "uint256"
			}
		],
		name: "InvalidMarketId",
		type: "error"
	},
	{
		inputs: [
		],
		name: "InvalidProof",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			}
		],
		name: "MetadataFetchFailed",
		type: "error"
	},
	{
		inputs: [
		],
		name: "NotInitializing",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "orderIndex",
				type: "uint256"
			}
		],
		name: "OrderAlreadyCanceled",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			}
		],
		name: "OwnableInvalidOwner",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "OwnableUnauthorizedAccount",
		type: "error"
	},
	{
		inputs: [
		],
		name: "ReentrancyGuardReentrantCall",
		type: "error"
	},
	{
		inputs: [
		],
		name: "ReferralRootNotSet",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			}
		],
		name: "SafeERC20FailedOperation",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			}
		],
		name: "TokenNotListed",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "total",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "minimumRequired",
				type: "uint256"
			}
		],
		name: "TotalTooSmall",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "TransferFailed",
		type: "error"
	},
	{
		inputs: [
		],
		name: "UUPSUnauthorizedCallContext",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "slot",
				type: "bytes32"
			}
		],
		name: "UUPSUnsupportedProxiableUUID",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "caller",
				type: "address"
			},
			{
				internalType: "address",
				name: "owner",
				type: "address"
			}
		],
		name: "Unauthorized",
		type: "error"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "Deposit",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previous",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "newRewarder",
				type: "address"
			}
		],
		name: "GeniRewarderUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint64",
				name: "version",
				type: "uint64"
			}
		],
		name: "Initialized",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "marketId",
				type: "uint256"
			},
			{
				indexed: true,
				internalType: "address",
				name: "trader",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "orderIndex",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "quantity",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "remainingQuantity",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "lastPrice",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "address",
				name: "referrer",
				type: "address"
			}
		],
		name: "OnPlaceBuyOrder",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "marketId",
				type: "uint256"
			},
			{
				indexed: true,
				internalType: "address",
				name: "trader",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "orderIndex",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "quantity",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "remainingQuantity",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "lastPrice",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "address",
				name: "referrer",
				type: "address"
			}
		],
		name: "OnPlaceSellOrder",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address"
			}
		],
		name: "OwnershipTransferred",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "Paused",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "Unpaused",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "implementation",
				type: "address"
			}
		],
		name: "Upgraded",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "recipient",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "Withdrawal",
		type: "event"
	},
	{
		inputs: [
		],
		name: "UPGRADE_INTERFACE_VERSION",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "WAD",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "baseAddress",
				type: "address"
			},
			{
				internalType: "address",
				name: "quoteAddress",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "minOrderAmount",
				type: "uint256"
			}
		],
		name: "addMarket",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "balances",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		name: "buyOrders",
		outputs: [
			{
				internalType: "address",
				name: "trader",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "price",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "quantity",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "marketId",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "orderIndex",
				type: "uint256"
			}
		],
		name: "cancelBuyOrder",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "marketId",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "orderIndex",
				type: "uint256"
			}
		],
		name: "cancelSellOrder",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "user",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "pointsToDeduct",
				type: "uint256"
			}
		],
		name: "deductUserPoints",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "depositEth",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "normalizedAmount",
				type: "uint256"
			}
		],
		name: "depositToken",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "feeReceiver",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "baseAddress",
				type: "address"
			},
			{
				internalType: "address",
				name: "quoteAddress",
				type: "address"
			}
		],
		name: "generateMarketHash",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
		],
		name: "geniRewarder",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getAllMarkets",
		outputs: [
			{
				components: [
					{
						internalType: "string",
						name: "symbol",
						type: "string"
					},
					{
						internalType: "uint256",
						name: "id",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "price",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "lastUpdatePrice",
						type: "uint256"
					},
					{
						internalType: "address",
						name: "baseAddress",
						type: "address"
					},
					{
						internalType: "address",
						name: "quoteAddress",
						type: "address"
					},
					{
						internalType: "address",
						name: "creator",
						type: "address"
					},
					{
						internalType: "bool",
						name: "isRewardable",
						type: "bool"
					}
				],
				internalType: "struct Storage.Market[]",
				name: "",
				type: "tuple[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			}
		],
		name: "getAndSetTokenMeta",
		outputs: [
			{
				internalType: "string",
				name: "symbol",
				type: "string"
			},
			{
				internalType: "uint8",
				name: "decimals",
				type: "uint8"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "marketId",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "minPrice",
				type: "uint256"
			}
		],
		name: "getBuyOrders",
		outputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "id",
						type: "uint256"
					},
					{
						internalType: "address",
						name: "trader",
						type: "address"
					},
					{
						internalType: "uint256",
						name: "price",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "quantity",
						type: "uint256"
					}
				],
				internalType: "struct Storage.OutputOrder[]",
				name: "rsBuyOrders",
				type: "tuple[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "marketID",
				type: "uint256"
			}
		],
		name: "getBuyOrdersLength",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getEthBalance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "enum Storage.OrderType",
				name: "orderType",
				type: "uint8"
			},
			{
				internalType: "uint256",
				name: "marketID",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "limit",
				type: "uint256"
			}
		],
		name: "getFilledOrders",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "id",
				type: "uint256"
			}
		],
		name: "getMarket",
		outputs: [
			{
				components: [
					{
						internalType: "string",
						name: "symbol",
						type: "string"
					},
					{
						internalType: "uint256",
						name: "id",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "price",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "lastUpdatePrice",
						type: "uint256"
					},
					{
						internalType: "address",
						name: "baseAddress",
						type: "address"
					},
					{
						internalType: "address",
						name: "quoteAddress",
						type: "address"
					},
					{
						internalType: "address",
						name: "creator",
						type: "address"
					},
					{
						internalType: "bool",
						name: "isRewardable",
						type: "bool"
					}
				],
				internalType: "struct Storage.Market",
				name: "",
				type: "tuple"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "baseAddress",
				type: "address"
			},
			{
				internalType: "address",
				name: "quoteAddress",
				type: "address"
			}
		],
		name: "getMarketID",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "enum Storage.OrderType",
				name: "orderType",
				type: "uint8"
			},
			{
				internalType: "uint256",
				name: "marketID",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "offset",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "limit",
				type: "uint256"
			}
		],
		name: "getOrders",
		outputs: [
			{
				components: [
					{
						internalType: "address",
						name: "trader",
						type: "address"
					},
					{
						internalType: "uint256",
						name: "price",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "quantity",
						type: "uint256"
					}
				],
				internalType: "struct Storage.Order[]",
				name: "orders",
				type: "tuple[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "referrer",
				type: "address"
			}
		],
		name: "getReferees",
		outputs: [
			{
				internalType: "address[]",
				name: "",
				type: "address[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "referee",
				type: "address"
			}
		],
		name: "getReferrer",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "marketId",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "maxPrice",
				type: "uint256"
			}
		],
		name: "getSellOrders",
		outputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "id",
						type: "uint256"
					},
					{
						internalType: "address",
						name: "trader",
						type: "address"
					},
					{
						internalType: "uint256",
						name: "price",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "quantity",
						type: "uint256"
					}
				],
				internalType: "struct Storage.OutputOrder[]",
				name: "rsSellOrders",
				type: "tuple[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "marketID",
				type: "uint256"
			}
		],
		name: "getSellOrdersLength",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			}
		],
		name: "getTokenBalance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address[]",
				name: "tokenAddresses",
				type: "address[]"
			}
		],
		name: "getTokensInfo",
		outputs: [
			{
				components: [
					{
						internalType: "address",
						name: "tokenAddress",
						type: "address"
					},
					{
						internalType: "string",
						name: "symbol",
						type: "string"
					},
					{
						internalType: "uint256",
						name: "usdMarketID",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "minOrderAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "minTransferAmount",
						type: "uint256"
					},
					{
						internalType: "uint8",
						name: "decimals",
						type: "uint8"
					},
					{
						internalType: "bool",
						name: "isUSD",
						type: "bool"
					}
				],
				internalType: "struct Tokens.TokenInfo[]",
				name: "",
				type: "tuple[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getTotalUnclaimedPoints",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "user",
				type: "address"
			}
		],
		name: "getUserPoints",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "initialOwner",
				type: "address"
			}
		],
		name: "initialize",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "marketCounter",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		name: "marketIDs",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		name: "markets",
		outputs: [
			{
				internalType: "string",
				name: "symbol",
				type: "string"
			},
			{
				internalType: "uint256",
				name: "id",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "price",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "lastUpdatePrice",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "baseAddress",
				type: "address"
			},
			{
				internalType: "address",
				name: "quoteAddress",
				type: "address"
			},
			{
				internalType: "address",
				name: "creator",
				type: "address"
			},
			{
				internalType: "bool",
				name: "isRewardable",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32[]",
				name: "proof",
				type: "bytes32[]"
			},
			{
				internalType: "address[]",
				name: "referees",
				type: "address[]"
			}
		],
		name: "migrateReferees",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "pause",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "paused",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "marketId",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "price",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "quantity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "filledOrderId",
				type: "uint256"
			},
			{
				internalType: "uint256[]",
				name: "sellOrderIDs",
				type: "uint256[]"
			},
			{
				internalType: "address",
				name: "referrer",
				type: "address"
			}
		],
		name: "placeBuyOrder",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "marketId",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "price",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "quantity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "filledOrderId",
				type: "uint256"
			},
			{
				internalType: "uint256[]",
				name: "buyOrderIDs",
				type: "uint256[]"
			},
			{
				internalType: "address",
				name: "referrer",
				type: "address"
			}
		],
		name: "placeSellOrder",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "pointDecimals",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
		],
		name: "proxiableUUID",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		name: "refereesOf",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "referralRoot",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "renounceOwnership",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		name: "sellOrders",
		outputs: [
			{
				internalType: "address",
				name: "trader",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "price",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "quantity",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_rewarder",
				type: "address"
			}
		],
		name: "setGeniRewarder",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "_referralRoot",
				type: "bytes32"
			}
		],
		name: "setReferralRoot",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_referrer",
				type: "address"
			}
		],
		name: "setReferrer",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "tokens",
		outputs: [
			{
				internalType: "string",
				name: "symbol",
				type: "string"
			},
			{
				internalType: "uint256",
				name: "usdMarketID",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "minOrderAmount",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "minTransferAmount",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "decimals",
				type: "uint8"
			},
			{
				internalType: "bool",
				name: "isUSD",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "totalUnclaimedPoints",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newOwner",
				type: "address"
			}
		],
		name: "transferOwnership",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "unpause",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "marketId",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "isRewardable",
				type: "bool"
			}
		],
		name: "updateMarketIsRewardable",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "minOrderAmount",
				type: "uint256"
			}
		],
		name: "updateMinOrderAmount",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "minTransferAmount",
				type: "uint256"
			}
		],
		name: "updateMinTransferAmount",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				internalType: "bool",
				name: "isUSD",
				type: "bool"
			}
		],
		name: "updateTokenIsUSD",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "marketID",
				type: "uint256"
			}
		],
		name: "updateUSDMarketID",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newImplementation",
				type: "address"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "upgradeToAndCall",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "userPoints",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "userReferrer",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "withdrawEth",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "normalizedAmount",
				type: "uint256"
			}
		],
		name: "withdrawToken",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];

class Markets {
    constructor(_genidex) {
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
    }
    /**
     * Fetch all existing markets and return them as an object indexed by market ID.
     * @returns A Promise resolving to a record of markets keyed by market ID.
     */
    async getAllMarkets() {
        try {
            const rawMarkets = await this.genidex.readContract('getAllMarkets');
            const marketMap = {};
            for (const m of rawMarkets) {
                const id = BigInt(m.id).toString();
                marketMap[id] = {
                    symbol: m.symbol,
                    id: BigInt(m.id.toString()),
                    price: BigInt(m.price.toString()),
                    lastUpdatePrice: BigInt(m.lastUpdatePrice.toString()),
                    baseAddress: m.baseAddress.toLowerCase(),
                    quoteAddress: m.quoteAddress.toLowerCase(),
                    creator: m.creator,
                    isRewardable: m.isRewardable,
                };
            }
            return marketMap;
        }
        catch (error) {
            await this.genidex.revertError(error, 'getAllMarkets');
        }
    }
    /**
     * Fetch a single market by ID from the GeniDex contract.
     *
     * @param marketId - The ID of the market to fetch.
     * @returns A Promise resolving to a Market object.
     */
    async getMarket(marketId) {
        const raw = await this.genidex.readContract('getMarket', [marketId]);
        return {
            id: BigInt(raw.id.toString()),
            symbol: raw.symbol,
            price: BigInt(raw.price.toString()),
            lastUpdatePrice: BigInt(raw.lastUpdatePrice.toString()),
            baseAddress: raw.baseAddress,
            quoteAddress: raw.quoteAddress,
            creator: raw.creator,
            isRewardable: raw.isRewardable
        };
    }
}

const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount)",
    "function burn(uint256 amount)"
];
class ERC20 {
    constructor(tokenAddress, provider) {
        this.verifiedContract = false;
        this.provider = provider;
        this.address = tokenAddress;
        this.contract = new Contract(tokenAddress, ERC20_ABI, provider);
    }
    /**
     * Returns a new contract instance using the provided signer.
     * If no signer is passed, it falls back to the provider (read-only).
     *
     * @param signer - Optional signer for sending transactions.
     * @returns A new Contract instance connected with signer or provider.
     */
    getContract(signer) {
        const runner = signer ?? this.provider;
        return new Contract(this.address, ERC20_ABI, runner);
    }
    async readContract(method, args = []) {
        try {
            this.verifyMethodExists(this.contract, method);
            const result = await this.contract[method](...args);
            return result;
        }
        catch (err) {
            await this.verifyContractExists();
            // console.error(`readContract: Error calling "${method}"`, err);
            throw err;
        }
    }
    verifyMethodExists(contract, method) {
        if (typeof contract[method] !== "function") {
            throw new Error(`Method "${method}" does not exist on the contract.`);
        }
    }
    async verifyContractExists() {
        if (this.verifiedContract)
            return true;
        const code = await this.provider.getCode(this.address);
        if (code === '0x') {
            throw new Error(`❌ No contract deployed at address: ${this.address}`);
        }
        this.verifiedContract = true;
        return true;
    }
    async name() {
        return await this.contract.name();
    }
    async symbol() {
        return await this.contract.symbol();
    }
    async decimals() {
        return await this.contract.decimals();
    }
    async totalSupply() {
        return await this.contract.totalSupply();
    }
    async balanceOf(account) {
        return await this.contract.balanceOf(account);
    }
    async normBalanceOf(account, decimals) {
        const rawBalance = await this.contract.balanceOf(account);
        const normBalance = utils.toNormAmount(rawBalance, decimals);
        return normBalance;
    }
    async allowance(owner, spender) {
        return await this.readContract('allowance', [owner, spender]);
        // return await this.contract.allowance(owner, spender);
    }
    async approve(signer, spender, amount) {
        const contract = this.getContract(signer);
        const tx = await contract.approve(spender, amount);
        await tx.wait();
    }
    async transfer(to, amount) {
        const tx = await this.contract.transfer(to, amount);
        await tx.wait();
    }
    async transferFrom(from, to, amount) {
        const tx = await this.contract.transferFrom(from, to, amount);
        await tx.wait();
    }
    /**
     * Mint new tokens to the specified address.
     * Note: Only works if the token contract exposes a mint() function and caller has permission.
     */
    async mint(signer, to, amount) {
        const contract = this.getContract(signer);
        if (!this.contract.mint)
            throw new Error("mint() not available on this contract");
        const tx = await contract.mint(to, amount);
        await tx.wait();
    }
    /**
     * Burn tokens from the connected signer.
     * Note: Only works if the token contract supports burn().
     */
    async burn(amount) {
        if (!this.contract.burn)
            throw new Error("burn() not available on this contract");
        const tx = await this.contract.burn(amount);
        await tx.wait();
    }
    /**
     * Fetch and return token metadata: symbol, name, and decimals.
     */
    async getMeta() {
        const [symbol, name, decimals] = await Promise.all([
            this.contract.symbol(),
            this.contract.name(),
            this.contract.decimals()
        ]);
        return { symbol, name, decimals };
    }
}

class Balances {
    constructor(_genidex) {
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
    }
    /**
     * Deposit native ETH into the DEX contract.
     *
     * This sends a payable transaction to the contract's `depositEth()` function.
     * The ETH value must be greater than zero, and will be stored in the user's balance.
     *
     * @param normAmount - The amount of ETH to deposit, in wei (as bigint or string).
     * @returns Promise that resolves once the transaction is confirmed.
     */
    async depositEth({ signer, normAmount, overrides = {} }) {
        if (!normAmount || BigInt(normAmount) <= 0n) {
            throw new Error("normAmount must be > 0");
        }
        const value = BigInt(normAmount);
        if (value <= 0n) {
            throw new Error("ETH amount must be greater than zero");
        }
        const tx = await this.genidex.writeContract({
            signer,
            method: "depositEth",
            overrides: {
                ...overrides,
                value,
            }
        });
        return tx;
    }
    /**
     * Withdraw native ETH from the DEX contract to the user's wallet.
     *
     * This sends a transaction to the contract's `withdrawEth(uint256)` function.
     * The contract should transfer ETH back to msg.sender if they have sufficient balance.
     *
     * @param normAmount - The amount of ETH to withdraw, in wei (bigint or compatible BigNumberish).
     * @returns Promise that resolves once the transaction is confirmed.
     */
    async withdrawEth({ signer, normAmount, overrides = {} }) {
        if (BigInt(normAmount) <= 0n) {
            throw new Error("Withdrawal amount must be greater than zero");
        }
        const args = [
            normAmount
        ];
        return await this.genidex.writeContract({
            signer,
            method: "withdrawEth",
            args,
            overrides
        });
    }
    /**
     * Deposits a specified ERC20 token into the GeniDex contract using a normalized amount with 18 decimals.
     *
     * @param signer - The Signer instance used to sign the transaction.
     * @param tokenAddress - The address of the ERC20 token to deposit.
     * @param normAmount - The deposit amount, normalized to 18 decimals (as bigint or string).
     * @param normApproveAmount - The amount to approve for transfer, also in 18 decimals.
     * @returns A Promise that resolves to the transaction response if the deposit is initiated, or undefined otherwise.
     */
    async depositToken({ signer, tokenAddress, normAmount, normApproveAmount, overrides = {} }) {
        if (!normAmount || BigInt(normAmount) <= 0n) {
            throw new Error("normAmount must be > 0");
        }
        const erc20 = new ERC20(tokenAddress, this.genidex.provider);
        const token = await this.genidex.tokens.getTokenInfo(tokenAddress);
        const { decimals } = token;
        const rawAmount = utils.toRawAmount(normAmount, decimals);
        // Approve if needed
        const rawAllowance = await erc20.allowance(signer.getAddress(), this.genidex.address);
        if (rawAllowance < rawAmount) {
            const rawApproveAmount = utils.toRawAmount(normApproveAmount, decimals);
            await erc20.approve(signer, this.genidex.address, rawApproveAmount);
        }
        // Call depositToken(normalizedAmount)
        const args = [
            tokenAddress,
            normAmount
        ];
        return await this.genidex.writeContract({
            signer,
            method: "depositToken",
            args,
            overrides
        });
    }
    /**
     * Calls the withdrawToken function from the GeniDex contract.
     *
     * @param signer - Signer to send the transaction
     * @param tokenAddress - Address of the token to withdraw
     * @param normAmount - Amount in normalized (18-decimal) format
     */
    async withdrawToken({ signer, tokenAddress, normAmount, overrides = {} }) {
        const args = [
            tokenAddress,
            normAmount
        ];
        const method = 'withdrawToken';
        return await this.genidex.writeContract({ signer, method, args, overrides });
    }
    /**
     * Get the balance of accountAddress on GeniDex.
     *
     * @param accountAddress
     * @param tokenOrEtherAddress - Token address or ETH_ADDRESS (0x0).
     * @returns Promise resolving to the deposited balance (as bigint), normalized to 18 decimals.
     */
    async getBalance(accountAddress, tokenOrEtherAddress) {
        const args = [accountAddress, tokenOrEtherAddress];
        const normAmount = await this.genidex.readContract('balances', args);
        return normAmount;
    }
}

/**
 * @group Contracts
 */
class BuyOrders {
    constructor(_genidex) {
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
    }
    /**
     * Place a buy order on the specified market.
     *
     * This function:
     * 1. Fetches matching sell order IDs for the given market and price.
     * 2. Randomly selects a filled buy order ID (if applicable).
     * 3. Submits a `placeBuyOrder` transaction with all parameters.
     *
     * @param params - Object containing all order parameters.
     * @param params.signer - Signer used to send the transaction.
     * @param params.marketId - ID of the market (e.g. 1).
     * @param params.normPrice - Price per unit (normalized to 18 decimals).
     * @param params.normQuantity - Quantity to buy (base token, 18 decimals).
     * @param params.referrer - Referral address (or zero address).
     * @returns TransactionResponse.
     */
    async placeBuyOrder({ signer, marketId, normPrice, normQuantity, referrer = ZeroAddress, overrides = {} }) {
        const sellOrderIds = await this.genidex.sellOrders.getMatchingSellOrderIds(marketId, normPrice, normQuantity);
        const filledBuyOrderId = await this.randomFilledBuyOrderID(marketId);
        const args = [
            marketId,
            normPrice,
            normQuantity,
            filledBuyOrderId,
            sellOrderIds,
            referrer,
        ];
        const method = 'placeBuyOrder';
        return await this.genidex.writeContract({ signer, method, args, overrides });
    }
    /**
     * Cancel a buy order on the specified market.
     *
     * @param signer - The signer (wallet) performing the cancellation.
     * @param marketId - The ID of the market where the buy order exists.
     * @param orderIndex - The index of the buy order to cancel.
     * @returns The transaction response object.
     */
    async cancelBuyOrder({ signer, marketId, orderIndex, overrides = {} }) {
        const args = [marketId, orderIndex];
        const method = 'cancelBuyOrder';
        return await this.genidex.writeContract({ signer, method, args, overrides });
    }
    /**
     * Fetch list of buy orders for a market with price <= maxPrice.
     *
     * @param marketId - ID of the market
     * @param maxPrice - Max acceptable price (normalized to 18 decimals)
     * @returns Array of matching OutputOrder objects
     */
    async getBuyOrders(marketId, maxPrice) {
        const rawOrders = await this.contract["getBuyOrders(uint256,uint256)"](marketId, maxPrice);
        return rawOrders.map((o) => ({
            id: BigInt(o.id.toString()),
            trader: o.trader,
            price: BigInt(o.price.toString()),
            quantity: BigInt(o.quantity.toString()),
        }));
    }
    async getAllBuyOrders(marketId) {
        const rawOrders = [];
        const ordersTotal = await this.getBuyOrdersLength(marketId);
        const pageSize = 3700;
        let offset = 0;
        const typeOrder = 0; // buy: 0, sell: 1
        while (offset < ordersTotal) {
            const page = await this.contract["getOrders"](typeOrder, marketId, offset, pageSize);
            offset += pageSize;
            rawOrders.push(...page);
        }
        // return allOrders;
        return rawOrders.map((o, index) => ({
            id: BigInt(index.toString()),
            trader: o.trader,
            price: BigInt(o.price.toString()),
            quantity: BigInt(o.quantity.toString()),
        }));
    }
    async getBuyOrdersLength(marketId) {
        const buyOrderLength = await this.contract["getBuyOrdersLength"](marketId);
        return buyOrderLength;
    }
    /**
     * Sorts an array of sell orders by price descending (high to low).
     * @param orders - Array of sell orders
     * @returns Sorted array
     */
    sortBuyOrders(orders) {
        return [...orders].sort((a, b) => {
            if (a.price < b.price)
                return 1;
            if (a.price > b.price)
                return -1;
            return 0;
        });
    }
    /**
     * Selects buy order IDs (sorted ascending by price) such that
     * the cumulative quantity exceeds or equals the requested normQuantity.
     *
     * @param sortedBuyOrders - Array of sell orders sorted by price ascending
     * @param normQuantity - Maximum total quantity needed
     * @returns Array of order IDs
     */
    getBuyOrderIds(sortedBuyOrders, normQuantity) {
        const selectedIds = [];
        let total = 0n;
        const target = getBigInt(normQuantity);
        for (const order of sortedBuyOrders) {
            if (total >= target)
                break;
            selectedIds.push(order.id);
            total += order.quantity;
        }
        return selectedIds;
    }
    async getFilledBuyOrderIds(marketId, limit = 1000) {
        const typeOrder = 0; // buy: 0, sell: 1
        const rawIds = await this.contract["getFilledOrders"](typeOrder, marketId, limit);
        // console.log(rawOrders);
        return rawIds.map(id => BigInt(id.toString()));
    }
    /**
     * Returns a random ID of a buy order that has been fully filled (quantity == 0).
     *
     * @param marketId - ID of the market
     * @returns Random filled order ID (bigint) or null if none found
     */
    async randomFilledBuyOrderID(marketId) {
        // const filledBuyOrderIDs = this.genidex.getFilledOrderIDs(marketBuyOrders);
        const filledBuyOrderIDs = await this.getFilledBuyOrderIds(marketId);
        const random = Math.floor(Math.random() * filledBuyOrderIDs.length);
        const filledBuyOrderId = filledBuyOrderIDs[random];
        return filledBuyOrderId || 0n;
    }
    /**
     * Get a list of buy order IDs that can match a sell order based on price and quantity.
     *
     * @param marketId - The market identifier.
     * @param normPrice - The normalized minimum acceptable price (18 decimals).
     * @param normQuantity - The normalized quantity to sell (18 decimals).
     * @returns An array of matching buy order IDs, sorted by best price first.
     */
    async getMatchingBuyOrderIds(marketId, normPrice, normQuantity) {
        const sellOrders = await this.getBuyOrders(marketId, normPrice);
        const sortedBuyOrders = this.sortBuyOrders(sellOrders);
        const buyOrderIds = this.genidex.getMatchingOrderIds(sortedBuyOrders, normQuantity);
        return buyOrderIds;
    }
}

class SellOrders {
    constructor(_genidex) {
        this.genidex = _genidex;
        this.contract = this.genidex.contract;
    }
    /**
     * Place a sell order on the specified market.
     *
     * This function:
     * 1. Fetches matching buy order IDs based on price and quantity.
     * 2. Randomly selects a filled sell order ID if applicable.
     * 3. Sends a `placeSellOrder` transaction with the required parameters.
     *
     * @param params - Object containing order parameters.
     * @param params.signer - Signer used to send the transaction.
     * @param params.marketId - ID of the market (e.g. 1).
     * @param params.normPrice - Price per unit (normalized to 18 decimals).
     * @param params.normQuantity - Quantity to sell (base token, 18 decimals).
     * @param params.referrer - Address of the referrer, or zero address.
     * @returns TransactionResponse.
     */
    async placeSellOrder({ signer, marketId, normPrice, normQuantity, referrer = ZeroAddress, overrides = {} }) {
        const buyOrders = this.genidex.buyOrders;
        const buyOrderIds = await buyOrders.getMatchingBuyOrderIds(marketId, normPrice, normQuantity);
        const filledSellOrderId = await this.randomFilledSellOrderID(marketId);
        // console.log(sellOrders);
        const args = [
            marketId,
            normPrice,
            normQuantity,
            filledSellOrderId,
            buyOrderIds,
            referrer
        ];
        const method = 'placeSellOrder';
        return await this.genidex.writeContract({ signer, method, args, overrides });
    }
    /**
     * Cancel a sell order on the specified market.
     *
     * @param signer - The signer (wallet) performing the cancellation.
     * @param marketId - The ID of the market where the sell order exists.
     * @param orderIndex - The index of the sell order to cancel.
     * @returns The transaction response object.
     */
    async cancelSellOrder({ signer, marketId, orderIndex, overrides = {} }) {
        const args = [marketId, orderIndex];
        const method = 'cancelSellOrder';
        return await this.genidex.writeContract({ signer, method, args, overrides });
    }
    async getFilledSellOrderIds(marketId, limit = 1000) {
        const typeOrder = 1; // buy: 0, sell: 1
        const rawIds = await this.contract["getFilledOrders"](typeOrder, marketId, limit);
        // console.log(rawOrders);
        return rawIds.map(id => BigInt(id.toString()));
    }
    /**
     * Returns a random ID of a buy order that has been fully filled (quantity == 0).
     *
     * @param marketId - ID of the market
     * @returns Random filled order ID (bigint) or null if none found
     */
    async randomFilledSellOrderID(marketId) {
        // const filledSellOrderIDs = this.genidex.getFilledOrderIDs(marketSellOrders);
        const filledSellOrderIDs = await this.getFilledSellOrderIds(marketId);
        const random = Math.floor(Math.random() * filledSellOrderIDs.length);
        const filledSellOrderId = filledSellOrderIDs[random];
        return filledSellOrderId || 0n;
    }
    async getAllSellOrders(marketId) {
        const rawOrders = [];
        const ordersTotal = await this.getSellOrdersLength(marketId);
        const pageSize = 3700;
        let offset = 0;
        const typeOrder = 1; // buy: 0, sell: 1
        while (offset < ordersTotal) {
            const page = await this.contract["getOrders"](typeOrder, marketId, offset, pageSize);
            offset += pageSize;
            rawOrders.push(...page);
        }
        // return allOrders;
        return rawOrders.map((o, index) => ({
            id: BigInt(index.toString()),
            trader: o.trader,
            price: BigInt(o.price.toString()),
            quantity: BigInt(o.quantity.toString()),
        }));
    }
    async getSellOrdersLength(marketId) {
        const sellOrderLength = await this.contract["getSellOrdersLength"](marketId);
        return sellOrderLength;
    }
    /**
     * Fetch list of sell orders for a market with price <= maxPrice.
     *
     * @param marketId - ID of the market
     * @param maxPrice - Max acceptable price (normalized to 18 decimals)
     * @returns Array of matching OutputOrder objects
     */
    async getSellOrders(marketId, maxPrice) {
        const rawOrders = await this.contract["getSellOrders(uint256,uint256)"](marketId, maxPrice);
        return rawOrders.map((o) => ({
            id: BigInt(o.id.toString()),
            trader: o.trader,
            price: BigInt(o.price.toString()),
            quantity: BigInt(o.quantity.toString()),
        }));
    }
    /**
     * Sorts an array of sell orders by price ascending (low to high).
     * @param orders - Array of sell orders
     * @returns Sorted array
     */
    sortSellOrders(orders) {
        return [...orders].sort((a, b) => {
            if (a.price < b.price)
                return -1;
            if (a.price > b.price)
                return 1;
            return 0;
        });
    }
    /**
     * Get a list of sell order IDs that can match a buy order based on price and quantity.
     * @param marketId - The ID of the market to query.
     * @param normPrice - The maximum buy price (normalized to 18 decimals).
     * @param normQuantity - The desired buy quantity (normalized to 18 decimals).
     * @returns An array of matching sell order IDs, ordered by best price.
     */
    async getMatchingSellOrderIds(marketId, normPrice, normQuantity) {
        const sellOrders = await this.getSellOrders(marketId, normPrice);
        const sortedSellOrders = this.sortSellOrders(sellOrders);
        const sellOrderIds = this.genidex.getMatchingOrderIds(sortedSellOrders, normQuantity);
        return sellOrderIds;
    }
}

class Tokens {
    constructor(_genidex) {
        this.tokensInfo = {};
        this.genidex = _genidex;
        this.contract = _genidex.contract;
    }
    /**
     * Fetch metadata for a list of token addresses from the GeniDex contract.
     *
     * This method calls the on-chain `getTokensInfo(address[])` view function,
     * which returns details such as symbol, decimals, and market association for each token.
     *
     * @param tokenAddresses - An array of token contract addresses to query.
     * @returns A Promise resolving to an array of TokenInfo objects containing metadata for each token.
     *
     * Example output:
     * [
     *   {
     *     tokenAddress: "0xabc...",
     *     symbol: "USDC",
     *     usdMarketID: 1n,
     *     minOrderAmount: 10000000000000000000n
     *     decimals: 6,
     *     isUSD: true
     *   },
     *   ...
     * ]
     */
    async getTokensInfo(tokenAddresses) {
        const rawResults = await this.contract.getTokensInfo(tokenAddresses);
        return rawResults.map((item) => ({
            tokenAddress: item.tokenAddress,
            symbol: item.symbol,
            usdMarketID: BigInt(item.usdMarketID.toString()),
            minOrderAmount: BigInt(item.minOrderAmount.toString()),
            decimals: Number(item.decimals),
            isUSD: item.isUSD,
        }));
    }
    /**
     * Get metadata of a specific token.
     * If already cached, return from this.tokens.
     * Otherwise, fetch from contract and cache it.
     *
     * @param tokenAddress The address of the token.
     * @returns Promise resolving to TokenInfo or undefined if fetch fails.
     */
    async getTokenInfo(tokenAddress) {
        const key = tokenAddress.toLowerCase();
        // Return from cache if available
        if (this.tokensInfo[key]) {
            return this.tokensInfo[key];
        }
        // validate input
        if (!isAddress(tokenAddress)) {
            throw new Error(`Invalid token address: ${tokenAddress}`);
        }
        try {
            const infos = await this.getTokensInfo([tokenAddress]);
            if (infos.length === 1) {
                this.tokensInfo[key] = infos[0];
                return infos[0];
            }
        }
        catch (err) {
            console.error("Failed to fetch token info:", err);
        }
        return {};
    }
    /**
     * Fetch all unique token addresses that are listed in any market.
     * This includes both base and quote tokens.
     * @returns A Promise resolving to an array of unique token addresses.
     */
    async getAllTokens() {
        const rawMarkets = await this.contract.getAllMarkets();
        const tokenSet = new Set();
        for (const m of rawMarkets) {
            tokenSet.add(m.baseAddress.toLowerCase());
            tokenSet.add(m.quoteAddress.toLowerCase());
        }
        return Array.from(tokenSet);
    }
    /**
     * Fetch metadata for all unique tokens listed in any market.
     * Returns a record where keys are token addresses (lowercased)
     * and values are TokenInfo objects.
     *
     * Example:
     * {
     *   "0xabc...": { tokenAddress: "0xabc...", symbol: "USDC", ... },
     *   "0xdef...": { tokenAddress: "0xdef...", symbol: "WETH", ... },
     * }
     *
     * @returns Promise resolving to a record of tokenAddress -> TokenInfo.
     */
    async getAllTokensInfo() {
        const tokenAddresses = await this.getAllTokens();
        const tokensInfo = await this.getTokensInfo(tokenAddresses);
        const result = {};
        for (const info of tokensInfo) {
            result[info.tokenAddress.toLowerCase()] = info;
        }
        this.tokensInfo = result; // cache the result
        return result;
    }
}

const IERC20Errors = [
    "error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)",
    "error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)",
    "error ERC20InvalidReceiver(address receiver)",
    "error ERC20InvalidSender(address sender)",
    "error ERC20InvalidApprover(address approver)",
    "error ERC20InvalidSpender(address spender)"
];

var localhost = {
	chainId: 31337,
	contracts: {
		GeniDex: "0x671E6708FBE36A1995765a78Eb8246481f4B78bE",
		GeniToken: "0x999bCDA71acd8feAE9C42edd18a9B960D3EC3999",
		GeniRewarder: "0x4826533B4897376654Bb4d4AD88B7faFD0C98528"
	}
};
var geni = {
	chainId: 31339,
	contracts: {
		GeniDex: "0x671E6708FBE36A1995765a78Eb8246481f4B78bE",
		GeniToken: "0x999bCDA71acd8feAE9C42edd18a9B960D3EC3999",
		GeniRewarder: "0x4826533B4897376654Bb4d4AD88B7faFD0C98528"
	}
};
var sepolia = {
	chainId: 11155111,
	contracts: {
		GeniDex: "0x9999000Cb8AF7d5EC3F5f3347B88C4d54feF9999",
		GeniToken: "0xAAAA361CEdb3A7fdE5D34B58Aa4585418F49AAAA",
		GeniRewarder: null
	}
};
var arb_sepolia = {
	chainId: 421614,
	contracts: {
		GeniDex: "0x9999000Cb8AF7d5EC3F5f3347B88C4d54feF9999",
		GeniToken: "0xAAAA361CEdb3A7fdE5D34B58Aa4585418F49AAAA",
		GeniRewarder: null
	}
};
var op_sepolia = {
	chainId: 11155420,
	contracts: {
		GeniDex: "0x9999000Cb8AF7d5EC3F5f3347B88C4d54feF9999",
		GeniToken: "0xAAAA361CEdb3A7fdE5D34B58Aa4585418F49AAAA",
		GeniRewarder: null
	}
};
var base_sepolia = {
	chainId: 84532,
	contracts: {
		GeniDex: "0x9999000Cb8AF7d5EC3F5f3347B88C4d54feF9999",
		GeniToken: "0xAAAA361CEdb3A7fdE5D34B58Aa4585418F49AAAA",
		GeniRewarder: null
	}
};
var rawNetworks = {
	localhost: localhost,
	geni: geni,
	sepolia: sepolia,
	arb_sepolia: arb_sepolia,
	op_sepolia: op_sepolia,
	base_sepolia: base_sepolia
};

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
const config = new Config();

class Tx {
    constructor(_genidex) {
        this.genidex = _genidex;
        this.abi = this.genidex.abi;
        this.contract = this.genidex.contract;
        this.iface = new Interface(this.abi);
    }
    async wait(txHash, opts = {}) {
        let { confirmations = 1, timeoutMs = 120000, pollMs = 1000, onProgress } = opts;
        const provider = this.genidex.provider;
        if (!txHash)
            return;
        const tx = await provider.getTransaction(txHash);
        // console.log(tx)
        if (!tx) {
            throw new Error(`Transaction not found: ${txHash}`);
        }
        // log(decode)
        while (true) {
            const receipt = await provider.getTransactionReceipt(tx.hash);
            // log(receipt);
            if (receipt) {
                if (receipt.status === 0) {
                    await this.handleFailedTx(tx, receipt);
                }
                const currentBlock = await provider.getBlockNumber();
                const confNow = currentBlock - receipt.blockNumber + 1;
                // Enough confirmations?  ➜  resolve with the receipt
                if (confNow >= confirmations)
                    return receipt;
            }
            // Detect dropped / replaced transactions
            const mempoolTx = await provider.getTransaction(tx.hash);
            if (!mempoolTx && !receipt) {
                const error = new Error("Transaction was dropped or replaced without a receipt");
                error.code = "TRANSACTION_REPLACED";
                error.tx = tx;
                const decodedTx = this.decodeTx(tx);
                if (decodedTx) {
                    error.invocation = {
                        method: decodedTx.name,
                        signature: decodedTx.signature,
                        args: decodedTx.args,
                        // overrides: this.extractOverrides(tx),
                        message: utils.errorDescriptionToString(decodedTx)
                    };
                }
                throw error;
                // const newTx = await this.findTxByNonce(tx.from, tx.nonce);
                // if(newTx){
                //     let newReceipt = await this.wait(newTx.hash);
                //     (newReceipt as any).firstHash = tx.hash;
                //     return newReceipt;
                // }
            }
            await new Promise((r) => setTimeout(r, pollMs));
            if (pollMs < 60000) {
                pollMs += pollMs * 2;
            }
            // log(pollMs);
        }
    }
    async findTxByNonce(address, nonce) {
        const provider = this.genidex.provider;
        const latest = await provider.getBlockNumber();
        const minBlock = latest - 5;
        for (let i = latest; i >= minBlock; i--) {
            const block = await provider.getBlock(i, true);
            const tx = block?.prefetchedTransactions.find((tx) => tx.from.toLowerCase() === address.toLowerCase() && tx.nonce === nonce);
            if (tx) {
                // console.log("Found:", tx.hash);
                return tx;
            }
        }
        // console.log("Transaction not found");
    }
    async handleFailedTx(tx, receipt) {
        const provider = this.genidex.provider;
        const decodedTx = this.decodeTx(tx);
        try {
            await provider.call({
                ...tx,
                blockTag: receipt.blockNumber
            });
        }
        catch (error) {
            error.tx = tx;
            error.receipt = receipt;
            // await this.revertError(error, functionName, args);
            const decodedError = this.decodeError(error);
            // log(decodedError);
            if (decodedError) {
                error.reason = utils.errorDescriptionToString(decodedError);
                error.revert = {
                    name: decodedError.name,
                    signature: decodedError.signature,
                    args: decodedError.args,
                    message: utils.errorDescriptionToString(decodedError)
                };
            }
            // console.log(decodedTx);
            if (decodedTx) {
                error.invocation = {
                    method: decodedTx.name,
                    signature: decodedTx.signature,
                    args: decodedTx.args,
                    // overrides: this.extractOverrides(tx),
                    message: utils.errorDescriptionToString(decodedTx)
                };
            }
            throw error;
        }
    }
    decodeTx(tx) {
        // if(!tx) return;
        const decoded = this.iface.parseTransaction({
            data: tx.data,
            value: tx.value,
        });
        if (!decoded) {
            throw new Error("Failed to decode transaction.");
        }
        return decoded;
    }
    decodeLogs(logs) {
        const decodedEvents = [];
        for (const log of logs) {
            try {
                const parsed = this.iface.parseLog(log);
                if (!parsed)
                    return;
                decodedEvents.push({
                    name: parsed.name,
                    signature: parsed.signature,
                    args: parsed.args,
                    argsObject: this.argsLogToObject(parsed),
                    logIndex: log.index,
                    transactionHash: log.transactionHash,
                    address: log.address,
                });
            }
            catch (e) {
                continue;
            }
        }
        return decodedEvents;
    }
    decodeError(error) {
        if (!error.data || error.data == '0x')
            return null;
        // log(error);
        const decoded = this.iface.parseError(error.data);
        return decoded;
    }
    argsLogToObject(parsed) {
        const obj = {};
        parsed.fragment.inputs.forEach((input, index) => {
            const key = input.name && input.name.length ? input.name : index.toString();
            obj[key] = parsed.args[index];
        });
        return obj;
    }
}

/**
 * @group GeniDex
 */
class GeniDex {
    constructor() {
        this.verifiedProvider = false;
        this.verifiedContract = false;
    }
    async connect(networkName, provider) {
        await this.verifyProviderNetwork(networkName, provider);
        this.abi = abi;
        this.iface = new Interface(this.abi);
        this.provider = provider;
        this.network = config.getNetwork(networkName);
        this.address = this.network.contracts.GeniDex;
        this.contract = new Contract(this.address, abi, provider);
        this.markets = new Markets(this);
        this.tokens = new Tokens(this);
        this.balances = new Balances(this);
        this.buyOrders = new BuyOrders(this);
        this.sellOrders = new SellOrders(this);
        this.tx = new Tx(this);
    }
    /**
     * Verifies that the provider is connected to the expected chain ID from this.network
     * @throws if the chain ID does not match
     */
    async verifyProviderNetwork(networkName, provider) {
        if (this.verifiedProvider)
            return true;
        const network = config.getNetwork(networkName);
        const currentNetwork = await provider.getNetwork();
        const currentChainId = currentNetwork.chainId;
        if (currentChainId !== network.chainId) {
            throw new Error(`Chain ID mismatch: expected ${network.chainId}, got ${currentChainId}`);
        }
        this.verifiedProvider = true;
        return true;
        // console.log('verified ProviderNetwork')
    }
    /**
     * Returns a new contract instance using the provided signer.
     * If no signer is passed, it falls back to the provider (read-only).
     *
     * @param signer - Optional signer for sending transactions.
     * @returns A new Contract instance connected with signer or provider.
     */
    getContract(signer) {
        const runner = signer ?? this.provider;
        return new Contract(this.address, this.abi, runner);
    }
    /**
     * Calculate fee based on normalized amount.
     *
     * Formula: fee = normAmount / 1000n (0.1%)
     *
     * @param normAmount - The normalized amount (18 decimals), as bigint or string.
     * @returns Fee amount (also in 18 decimals), as bigint.
     */
    calculateFee(normAmount) {
        const amount = typeof normAmount === "string" ? BigInt(normAmount) : normAmount;
        return amount / 1000n;
    }
    /**
     * Returns IDs of buy orders that have been fully filled (quantity == 0).
     *
     * @param orders - Array of orders (OutputOrder[])
     * @returns Array of filled order IDs (bigint[])
     */
    getFilledOrderIDs(orders) {
        return orders
            .filter(order => getBigInt(order.quantity) === 0n)
            .map(order => order.id);
    }
    /**
     * Selects sell order IDs (sorted ascending by price) such that
     * the cumulative quantity exceeds or equals the requested normQuantity.
     *
     * @param sortedOrders - Array of orders sorted by price ascending
     * @param normQuantity - Maximum total quantity needed
     * @returns Array of order IDs
     */
    getMatchingOrderIds(sortedOrders, normQuantity) {
        const selectedIds = [];
        let total = 0n;
        const target = getBigInt(normQuantity);
        for (const order of sortedOrders) {
            if (total >= target)
                break;
            selectedIds.push(order.id);
            total += order.quantity;
        }
        return selectedIds;
    }
    async writeContract({ signer, method, args = [], overrides = {} }) {
        const contract = new Contract(this.address, this.abi, signer);
        this.verifyMethodExists(contract, method);
        await Promise.all([
            this.verifyContractExists(),
            this.verifySignerNetwork(signer),
            this.verifyStaticCallSucceeds(contract, method, args, overrides)
        ]);
        try {
            // const tx = await contract[method](...args, overrides);
            const tx = await contract.getFunction(method).send(...args, overrides);
            tx.waitForConfirms = async () => {
                return await this.waitForConfirms(tx, method, args, overrides, {});
                // return await this.waitForConfirms1(tx, 1, method, args);
            };
            return tx;
        }
        catch (error) {
            await this.revertError(error, method, args, overrides);
        }
    }
    async readContract(method, args = []) {
        try {
            this.verifyMethodExists(this.contract, method);
            const result = await this.contract[method](...args);
            return result;
        }
        catch (err) {
            await this.verifyContractExists();
            // console.error(`readContract: Error calling "${method}"`, err);
            throw err;
        }
    }
    /**
     * Verifies that the given signer is connected to the same network as this.network.chainId
     * @param signer - The signer to verify
     * @throws if chainId mismatch
     */
    async verifySignerNetwork(signer) {
        if (!signer.provider)
            return;
        const signerChainId = (await signer.provider.getNetwork()).chainId;
        if (signerChainId !== this.network.chainId) {
            throw new Error(`Chain ID mismatch: expected ${this.network.chainId}, got ${signerChainId}`);
        }
        // console.log('verified SignerNetwork')
    }
    async waitForConfirms1(tx, confirmations, method, args = []) {
        try {
            const receipt = await tx.wait(confirmations);
            // const receipt = await this.provider.waitForTransaction(tx.hash);
            if (receipt?.status === 1) {
                return receipt;
            }
            else {
                throw new Error(`Transaction reverted on-chain: ${tx.hash}`);
            }
        }
        catch (error) {
            try {
                await this.provider.call({
                    ...tx,
                    blockTag: error.receipt.blockNumber
                });
                // console.log('rawData', rawData);
            }
            catch (error2) {
                // console.log('error2')
                error2.receipt = error.receipt;
                await this.revertError(error2, method, args);
            }
            await this.revertError(error, method, args);
        }
    }
    /**
     * Wait for a transaction hash with richer control than tx.wait().
     * Throws if the tx is dropped/replaced, if it reverts, or if the timeout elapses.
    */
    async waitForConfirms(tx, functionName, args, overrides, opts = {}) {
        let { confirmations = 1, timeoutMs = 120000, pollMs = 1000, onProgress } = opts;
        const provider = this.provider;
        const started = Date.now();
        while (true) {
            // Try to fetch the mined receipt
            const receipt = await provider.getTransactionReceipt(tx.hash);
            console.log('=================', receipt);
            if (receipt) {
                // If mined but reverted (status === 0) → obtain and decode revert data
                if (receipt.status === 0) {
                    try {
                        await provider.call({
                            ...tx,
                            blockTag: receipt.blockNumber
                        });
                    }
                    catch (error) {
                        error.receipt = receipt;
                        await this.revertError(error, functionName, args, overrides);
                    }
                }
                // Count confirmations
                const currentBlock = await provider.getBlockNumber();
                const confNow = currentBlock - receipt.blockNumber + 1;
                if (onProgress)
                    onProgress(confNow);
                // Enough confirmations?  ➜  resolve with the receipt
                if (confNow >= confirmations)
                    return receipt;
            }
            // Abort if we have exceeded the timeout
            if (Date.now() - started > timeoutMs) {
                throw new Error(`Transaction still pending after ${timeoutMs} ms`);
            }
            // Detect dropped / replaced transactions
            const mempoolTx = await provider.getTransaction(tx.hash);
            if (!mempoolTx && !receipt) {
                throw new Error("Transaction was dropped or replaced without a receipt");
            }
            // Sleep before the next poll
            if (pollMs < 60000) {
                pollMs += pollMs * 20 / 100;
            }
            await new Promise((r) => setTimeout(r, pollMs));
        }
    }
    async verifyContractExists() {
        if (this.verifiedContract)
            return true;
        const code = await this.provider.getCode(this.address);
        if (code === '0x') {
            const message = `❌ Contract not found at ${this.address} on the ${this.network.name} network`;
            throw new Error(message);
        }
        this.verifiedContract = true;
        return true;
    }
    /**
     * Decode a revert error thrown by a failed contract transaction.
     *
     * @param err - The caught error object (usually from try/catch around tx).
     * @returns A formatted string with the error name and arguments, or undefined if cannot decode.
     */
    decodeRevertError(err) {
        if (typeof err !== "object" || err === null || !("data" in err)) {
            return;
        }
        const data = err.data;
        if (!data || typeof data !== "string")
            return;
        try {
            const interfaces = [
                new Interface(this.abi),
                new Interface(IERC20Errors),
            ];
            for (const iface of interfaces) {
                try {
                    const parsed = iface.parseError(data);
                    if (parsed) {
                        return parsed;
                    }
                }
                catch (_) {
                    continue;
                }
            }
        }
        catch (decodeErr) {
            return;
        }
    }
    /**
     * Handle and re-throw a contract revert error with decoded context.
     *
     * This function attempts to decode the revert reason from a caught error
     * using `this.decodeRevertError()`. If decoding is successful, it logs
     * and throws a formatted error with the decoded reason. If decoding fails,
     * it logs the raw error and throws a generic fallback message.
     *
     * @param err - The error object caught from a failed contract transaction.
     * @throws An Error containing the decoded or fallback message.
     */
    async revertError(err, functionName, args, overrides) {
        // if(err.code == 'CALL_EXCEPTION'){
        const fn = this.iface.getFunction(functionName);
        if (fn) {
            let invocation = new ErrorDescription(fn, fn?.selector, args);
            // err.invocation = utils.errorDescriptionToString(invocation);
            err.invocation = {
                name: invocation.name,
                signature: invocation.signature,
                args: invocation.args,
                selector: invocation.selector,
                message: utils.errorDescriptionToString(invocation),
                overrides
            };
        }
        const decodedError = this.decodeRevertError(err);
        if (decodedError) {
            err.reason = utils.errorDescriptionToString(decodedError);
            // err.revert = utils.errorDescriptionToString(decodedError);
            err.revert = {
                name: decodedError.name,
                signature: decodedError.signature,
                args: decodedError.args,
                selector: decodedError.selector,
                message: utils.errorDescriptionToString(decodedError)
            };
        }
        if (err.invocation?.message) {
            err.message = 'GeniDex Error:\n' + err.invocation.message;
        }
        if (err.revert?.message) {
            err.message += '\n' + err.revert.message;
        }
        if (!err.revert || !err.revert.message) {
            err.message = utils.jsonToString(err);
        }
        // }
        throw err;
    }
    /**
     * Map an array of contract call arguments to an object using ABI parameter names.
     *
     * @param methodName - The name of the function in the ABI.
     * @param args - Positional arguments array (must match ABI order).
     * @returns Object mapping parameter names to values.
     */
    mapArgsToObject(methodName, args) {
        const iface = new Interface(this.abi);
        const fn = iface.getFunction(methodName);
        console.log(fn);
        if (fn?.inputs.length !== args.length) {
            throw new Error(`Argument count mismatch for ${methodName}`);
        }
        const result = {};
        fn.inputs.forEach((input, index) => {
            result[input.name] = args[index];
        });
        return result;
    }
    verifyMethodExists(contract, method) {
        if (typeof contract[method] !== "function") {
            throw new Error(`Method "${method}" does not exist on the contract.`);
        }
    }
    async verifyStaticCallSucceeds(contract, method, args, overrides = {}) {
        try {
            await contract.getFunction(method).staticCall(...args, overrides);
        }
        catch (error) {
            await this.revertError(error, method, args, overrides);
        }
    }
    async pause(signer) {
        const overrides = {
        // gasPrice: parseUnits('300', 'gwei')
        };
        return await this.writeContract({ signer, method: 'pause', args: [], overrides });
    }
    async unpause(signer) {
        const overrides = {
        // gasPrice: parseUnits('300', 'gwei')
        };
        return await this.writeContract({ signer, method: 'unpause', args: [], overrides });
    }
}

export { Balances, BuyOrders, ERC20, GeniDex, Markets, NetworkName, SellOrders, Tokens, Utils, constants, utils };
//# sourceMappingURL=index.esm.js.map
