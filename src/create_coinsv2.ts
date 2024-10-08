import {
	bn,
	Provider,
	Script,
	ScriptRequest,
	ScriptTransactionRequest,
	Signer,
	Wallet,
} from "fuels";
import { MIN_COIN_AMONT } from "./constants";
import { readFileSync } from "node:fs";
import { sleep } from "bun";

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

	const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS;
	if (!RECIPIENT_ADDRESS) {
		console.error("RECIPIENT_ADDRESS is not defined in the environment variables.");
		process.exit(1);
	}

	const provider = await Provider.create(LOCAL_FUEL_NETWORK);

	const wallets: [{ privateKey: string; address: string }] = JSON.parse(
		readFileSync("wallets.json", "utf-8"),
	);

	while (true){

		for (let wallet of wallets) {
		const senderWallet = Wallet.fromPrivateKey(wallet.privateKey, provider);

		const scriptTransaction = await senderWallet.createTransfer(
			RECIPIENT_ADDRESS,
			MIN_COIN_AMONT
		);

		if (!(scriptTransaction.inputs.length === 1)) {
			throw new Error(
				`Expected 1 input, but found ${scriptTransaction.inputs.length} inputs for wallet ${wallet.address}`,
			);
		}

		senderWallet.sendTransaction(scriptTransaction).catch((err) =>{
			console.log('error:', err)
		} );

		// await sleep(1);
		}

	}
};

main();
