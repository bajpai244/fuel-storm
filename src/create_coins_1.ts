import {
	bn,
	Provider,
	Script,
	ScriptRequest,
	ScriptTransactionRequest,
	Signer,
	Wallet,
} from "fuels";

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
	const PRIVATE_KEY = process.env.FUNDER_PRIVATE_KEY_1;
	if (!PRIVATE_KEY) {
		console.error("FUNDER_PRIVATE_KEY_1 is not defined in the environment variables.");
		process.exit(1);
	}

	const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS;
	if (!RECIPIENT_ADDRESS) {
		console.error("RECIPIENT_ADDRESS is not defined in the environment variables.");
		process.exit(1);
	}

	const MIN_AMOUT = 10000;
	const gasPrice =await provider.getLatestGasPrice();
	const gasAmount =  gasPrice.mul(100);

	const baseAssetID = provider.getBaseAssetId();
	const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

	for (let i = 0; i < MIN_AMOUT; i += 1) {
		const coins = (await provider.getCoins(wallet.address)).coins;
		const coin = coins.find(({ amount }) => {
            console.log('amout:', amount);

			return bn(amount).gte(bn(MIN_AMOUT - i));
		});

		if (typeof coin === "undefined") {
			throw new Error(
				`No coin with sufficient amount found. Minimum required amount is ${MIN_AMOUT - i}. Current iteration: ${i}`,
			);
		}

		const scriptTransaction = await wallet.transfer(RECIPIENT_ADDRESS, 1);
		const result = await scriptTransaction.waitForResult();

		await(await wallet.transfer(RECIPIENT_ADDRESS, gasAmount)).waitForResult()
	}
};

main();
