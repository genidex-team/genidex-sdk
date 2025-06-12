
import { GeniDex, NetworkName } from "../src/index";
import { ethers } from "ethers";
import { config } from "./config";

let genidex  = new GeniDex();

describe("getMarket()", () => {
    beforeAll(async() => {
        await genidex.connect(config.networkName, config.provider);
    });

    test("should return a market object with expected properties", async () => {
        const marketId = "1";
        const market = await genidex.markets.getMarket(marketId);
        console.log(market)
        let {
            id, symbol, lastUpdatePrice, price,
            baseAddress, quoteAddress, creator, isRewardable
        } = market;

        expect(typeof market).toBe("object");

        // id
        expect(typeof id).toBe('bigint');
        expect(id).toBe( BigInt(marketId) );

        // symbol
        expect(symbol).not.toBe('');

        // baseAddress
        expect(typeof baseAddress).toBe('string');
        expect(baseAddress).not.toBe('');
        expect(baseAddress).not.toBe(ethers.ZeroAddress);

        // quoteAddress
        expect(typeof quoteAddress).toBe('string');
        expect(quoteAddress).not.toBe('');
        expect(quoteAddress).not.toBe(ethers.ZeroAddress);
    });
});
