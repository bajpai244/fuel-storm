import {
	bn,
	Provider,
	Script,
	ScriptRequest,
	ScriptTransactionRequest,
	Signer,
	Wallet,
	type Coin,
	type CursorPaginationArgs,
} from "fuels";
import { writeFileSync } from "node:fs";
import { getAllCoins } from "./lib";

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
	const PRIVATE_KEY = process.env.PRIVATE_KEY;
	if (!PRIVATE_KEY) {
		console.error("PRIVATE_KEY is not defined in the environment variables.");
		process.exit(1);
	}

	const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS;
	if (!RECIPIENT_ADDRESS) {
		console.error(
			"RECIPIENT_ADDRESS is not defined in the environment variables.",
		);
		process.exit(1);
	}

    const block = await provider.getBlock(13001009 + 6);
    console.log("current block:", block?.transactionIds.length);
};

main();
