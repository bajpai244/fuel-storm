import type { AbstractAddress, BN, Coin, Provider } from "fuels";
import { MIN_COIN_AMONT } from "./constants";

export const getAllCoins = async (recipientAddress: string | AbstractAddress,provider: Provider) => {
    const recipientCoins: Coin[] = [];

	let paginationArgs = {};

	while (true) {
		const { coins, pageInfo } = await provider.getCoins(
			recipientAddress,
			provider.getBaseAssetId(),
			paginationArgs,
		);

		recipientCoins.push(...coins);

		paginationArgs = {
			after: pageInfo.endCursor,
		};

		if (!pageInfo.hasNextPage) {
			break;
		}
	}

    return recipientCoins;
}

export const getMinAmountCoins = (coins: Coin[]) => {
    return coins.filter(({amount})=> {
        return amount.gte(MIN_COIN_AMONT);
    })
}

export const createCoinPairs = (coins: Coin[], gasAmount: BN) => {
    const oneCoins = []
    const gasCoins = []

    for (const coin of coins) {
        if (coin.amount.eq(1)) {
            oneCoins.push(coin);
        } else if (coin.amount.gte(gasAmount)) {
            gasCoins.push(coin);
        }
    }

    const pairs = [];
    const minLength = Math.min(oneCoins.length, gasCoins.length);

    for (let i = 0; i < minLength; i++) {
        pairs.push({
            gasCoin: gasCoins[i],
            oneCoin: oneCoins[i]
        });
    }

    return pairs;
}