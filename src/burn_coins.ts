import {
	bn,
	Provider,
	Script,
	ScriptTransactionRequest,
	Wallet,
} from "fuels";
import { createCoinPairs, getAllCoins, getMinAmountCoins } from "./lib";
import { MIN_COIN_AMONT } from "./constants";

// The script does the following:
// takes a single address, with some high amount of coin input
// generates 10k unique input coin by a recursive algorithm
// each iteration of the loop produces 256 output coin
// the end result is saved in a JSON file, called tx_data.json
// the json file is an array: [{tx_id: b256, output_idx: number}]
const main = async () => {
	// Create a provider.
	const LOCAL_FUEL_NETWORK = process.env.LOCAL_FUEL_NETWORK_URL;
	if (!LOCAL_FUEL_NETWORK) {
		console.error(
			"LOCAL_FUEL_NETWORK_URL is not defined in the environment variables.",
		);
		process.exit(1);
	}

	const provider = await Provider.create(LOCAL_FUEL_NETWORK);

	// Create our wallet (with a private key).
	const PRIVATE_KEY = process.env.RECIPIENT_PRIVATE_KEY;
	if (!PRIVATE_KEY) {
		console.error("RECIPIENT_PRIVATE_KEY is not defined in the environment variables.");
		process.exit(1);
	}

    const gasLimit = 100;
    const gasPrice = await provider.getLatestGasPrice();

	const baseAssetID = provider.getBaseAssetId();
	const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

    const randomRecipeint =  Wallet.generate();

    const  amount = await wallet.getBalance();


    await wallet.transfer(randomRecipeint.address, 100000 * 2);
};

main();
